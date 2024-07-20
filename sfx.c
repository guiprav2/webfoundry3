#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <archive.h>
#include <archive_entry.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <fcntl.h>

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
    char output_dir[64];
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

    // Change to the temporary directory
    if (chdir(output_dir) != 0) {
        perror("chdir");
        exit(EXIT_FAILURE);
    }

    // Execute the electron app
    printf("Starting Electron...\n");
    char *exec_args[] = {"node", "./node_modules/.bin/electron", ".", NULL};
    execvp("node", exec_args);

    // If execvp fails
    perror("execvp");
    exit(EXIT_FAILURE);

    return 0;
}
