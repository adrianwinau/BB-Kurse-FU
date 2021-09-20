import zipfile as zf
import os, shutil

PARENT_PATH = os.path.dirname(__file__)
HOME_PATH = os.path.dirname(PARENT_PATH)
SRC_PATH = os.path.join(HOME_PATH, "src")
EXCLUDE = set(["build"])

def _files_to_download(path, file_extension):
    list_of_files = []
    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in EXCLUDE] # exclude directories in platforms/
        archive_path = root.replace(path, "")
        archive_path = archive_path[1:]
        for file in files:
            if file_extension in str(file): continue
            file_to_add = (os.path.join(root, file), os.path.join(archive_path, file))
            list_of_files.append(file_to_add)
    return list_of_files

def build(path, file_extension):
    new_file_path = path + f"\\BB-Kurse-FU{file_extension}"
    list_of_files = _files_to_download(SRC_PATH, file_extension)
    list_of_files += _files_to_download(path, file_extension)

    with zf.ZipFile(new_file_path, "w", zf.ZIP_DEFLATED) as new_zip:
        for (file, arch_file) in list_of_files:
            new_zip.write(file, arch_file)
    
    BUILD_PATH = path + "\\build"
    if os.path.isdir(BUILD_PATH): shutil.rmtree(BUILD_PATH)
    with zf.ZipFile(new_file_path, "r", zf.ZIP_DEFLATED) as zip:
        zip.extractall(BUILD_PATH)

if __name__ == "__main__":
    for dir in os.listdir(PARENT_PATH):
        dir_path = os.path.join(PARENT_PATH, dir)
        if os.path.isdir(dir_path):
            if "firefox" in dir_path:
                build(dir_path, ".xpi")
            else:
                build(dir_path, ".crx")
