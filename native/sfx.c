#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <archive.h>
#include <archive_entry.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <fcntl.h>
#include <dirent.h>

// Global variable to store the path of the temporary directory
char output_dir[64];

// Function to recursively delete a directory
int delete_directory(const char *path) {
    struct dirent *entry;
    DIR *dir = opendir(path);
    if (!dir) {
        perror("opendir");
        return -1;
    }

    while ((entry = readdir(dir)) != NULL) {
        char fullpath[512];
        if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
            continue;
        }
        snprintf(fullpath, sizeof(fullpath), "%s/%s", path, entry->d_name);
        if (entry->d_type == DT_DIR) {
            delete_directory(fullpath);
        } else {
            unlink(fullpath);
        }
    }
    closedir(dir);
    rmdir(path);
    return 0;
}

// Cleanup function to delete the temporary directory
void cleanup() {
    if (delete_directory(output_dir) != 0) {
        fprintf(stderr, "Failed to delete temporary directory: %s\n", output_dir);
    }
}

void extract_tarball(const char *data, size_t size, const char *output_dir) {
    struct archive *archive;
    struct archive_entry *entry;
    int r;
    char fullpath[512];

    printf("Extracting tarball of size %zu bytes\n", size);
    archive = archive_read_new();
    archive_read_support_format_tar(archive);
    archive_read_support_filter_all(archive);

    r = archive_read_open_memory(archive, data, size);
    if (r != ARCHIVE_OK) {
        fprintf(stderr, "archive_read_open_memory() failed: %s\n", archive_error_string(archive));
        exit(EXIT_FAILURE);
    }

    while (archive_read_next_header(archive, &entry) == ARCHIVE_OK) {
        const char *current_file = archive_entry_pathname(entry);
        snprintf(fullpath, sizeof(fullpath), "%s/%s", output_dir, current_file);
        archive_entry_set_pathname(entry, fullpath);

        r = archive_read_extract(archive, entry, ARCHIVE_EXTRACT_TIME | ARCHIVE_EXTRACT_PERM | ARCHIVE_EXTRACT_ACL | ARCHIVE_EXTRACT_FFLAGS);
        if (r != ARCHIVE_OK) {
            fprintf(stderr, "archive_read_extract() failed: %s\n", archive_error_string(archive));
            exit(EXIT_FAILURE);
        }
    }

    archive_read_close(archive);
    archive_read_free(archive);
}

// Custom implementation of memmem
void *memmem(const void *haystack, size_t haystack_len, const void *needle, size_t needle_len) {
    if (needle_len == 0) return (void *)haystack;
    const char *haystack_c = (const char *)haystack;
    const char *needle_c = (const char *)needle;
    for (size_t i = 0; i <= haystack_len - needle_len; ++i) {
        if (memcmp(haystack_c + i, needle_c, needle_len) == 0) {
            return (void *)(haystack_c + i);
        }
    }
    return NULL;
}

int main(int argc, char *argv[]) {
    FILE *self;
    char *buffer;
    long size;
    char template[] = "/tmp/self_extract_XXXXXX";
    int fd;

    self = fopen(argv[0], "rb");
    if (!self) {
        perror("fopen");
        exit(EXIT_FAILURE);
    }

    fseek(self, 0, SEEK_END);
    size = ftell(self);
    fseek(self, 0, SEEK_SET);

    buffer = malloc(size);
    if (!buffer) {
        perror("malloc");
        exit(EXIT_FAILURE);
    }

    if (fread(buffer, 1, size, self) != size) {
        perror("fread");
        exit(EXIT_FAILURE);
    }

    fclose(self);

    // Create temporary directory
    strcpy(output_dir, template);
    fd = mkdtemp(output_dir);
    if (fd == -1) {
        perror("mkdtemp");
        exit(EXIT_FAILURE);
    }

    printf("Extracting to directory: %s\n", output_dir);

    char marker[512];
    snprintf(marker, sizeof(marker), "%s %s %s", "===", "TARSTART", "===");
    size_t marker_len = strlen(marker);
    char *marker_pos = buffer;
    while ((marker_pos = memmem(marker_pos, buffer + size - marker_pos, marker, marker_len)) != NULL) {
        marker_pos += marker_len; // Move past the marker

        // Find the end of the tarball
        char *next_marker = memmem(marker_pos, buffer + size - marker_pos, marker, marker_len);
        size_t tarball_size = (next_marker ? next_marker : buffer + size) - marker_pos;

        // Print information for debugging
        printf("Found tarball starting at %zu bytes, size %zu bytes\n", marker_pos - buffer, tarball_size);

        // Validate tarball size
        if (tarball_size <= 0) {
            fprintf(stderr, "Invalid tarball size %zu\n", tarball_size);
            exit(EXIT_FAILURE);
        }

        extract_tarball(marker_pos, tarball_size, output_dir);

        marker_pos = next_marker;
        if (!next_marker) break; // Exit loop if no further markers are found
    }

    // Fork a child process to execute the Electron app
    pid_t pid = fork();
    if (pid == -1) {
        perror("fork");
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        // Child process
        // Change to the temporary directory
        if (chdir(output_dir) != 0) {
            perror("chdir");
            exit(EXIT_FAILURE);
        }

        // Execute the Electron app
        printf("Starting app...\n");
        char *exec_args[] = {NULL};
        execvp("./webfoundry-app", exec_args);

        // If execvp fails
        perror("execvp");
        exit(EXIT_FAILURE);
    } else {
        // Parent process
        // Wait for the child process to finish
        int status;
        waitpid(pid, &status, 0);

        // Cleanup temporary directory
        cleanup();

        // Exit with the same status as the child process
        exit(WEXITSTATUS(status));
    }

    return 0;
}
