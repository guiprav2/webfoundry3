use tauri::Manager;
use std::process::Command;
use std::fs::File;
use std::io::{self, Read};
use std::thread::sleep;
use std::time::Duration;

fn read_port_from_file() -> io::Result<u16> {
    let mut file = File::open("/tmp/tauri-port")?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents.trim().parse().expect("Invalid port number"))
}

fn main() {
    // Start the local server
    Command::new("./node")
        .args(&["server/server.js"])
        .spawn()
        .expect("Failed to start local server");

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
