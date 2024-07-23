#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use std::fs::File;
use std::io::{self, Read};
use std::thread::sleep;
use std::time::Duration;
use std::ptr::null_mut;
use std::ffi::CString;

#[cfg(target_os = "windows")]
use winapi::um::processthreadsapi::{CreateProcessA, PROCESS_INFORMATION, STARTUPINFOA};
#[cfg(target_os = "windows")]
use winapi::um::winbase::DETACHED_PROCESS;

fn read_port_from_file() -> io::Result<u16> {
    let mut file = File::open("tauri-port")?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents.trim().parse().expect("Invalid port number"))
}

#[cfg(target_os = "windows")]
fn start_node_server() {
    let mut startup_info: STARTUPINFOA = unsafe { std::mem::zeroed() };
    startup_info.cb = std::mem::size_of::<STARTUPINFOA>() as u32;
    let mut process_info: PROCESS_INFORMATION = unsafe { std::mem::zeroed() };

    let command = CString::new("./node server/server.js").expect("CString::new failed");
    let command_ptr = command.as_ptr() as *mut i8;

    unsafe {
        if CreateProcessA(
            null_mut(),
            command_ptr,
            null_mut(),
            null_mut(),
            false as i32,
            DETACHED_PROCESS,
            null_mut(),
            null_mut(),
            &mut startup_info,
            &mut process_info,
        ) == 0
        {
            eprintln!("Failed to start local server: {}", std::io::Error::last_os_error());
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn start_node_server() {
    use std::process::Command;

    Command::new("./node")
        .args(&["server/server.js"])
        .spawn()
        .expect("Failed to start local server");
}

fn main() {
    // Start the local server
    start_node_server();

    // Wait for the server to start and write the port number
    sleep(Duration::from_secs(2));

    // Read the port number from the file
    let port = read_port_from_file().expect("Failed to read port number");

    // Construct the URL with the dynamic port number
    let dev_url = format!("http://localhost:{}", port);

    // Start the Tauri application
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![])
        .setup(move |app| {
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                let window = handle.get_window("main").unwrap();
                window.eval(&format!("window.location.replace('{}')", dev_url)).unwrap();
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
