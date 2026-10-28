import os
import sys
import shutil
import subprocess
import zipfile

PROJECT_DIR = r"C:\Users\user\mini-science-lab"
ANDROID_DIR = os.path.join(PROJECT_DIR, "android")
APP_DIR = os.path.join(ANDROID_DIR, "app")
SRC_MAIN = os.path.join(APP_DIR, "src", "main")
RES_DIR = os.path.join(SRC_MAIN, "res")
ASSETS_DIR = os.path.join(SRC_MAIN, "assets")
BUILD_DIR = os.path.join(PROJECT_DIR, "build_out")

JAVA_HOME = r"C:\Program Files\Android\Android Studio\jbr"
JAVAC = os.path.join(JAVA_HOME, "bin", "javac.exe")
KEYTOOL = os.path.join(JAVA_HOME, "bin", "keytool.exe")

SDK_DIR = r"C:\Users\user\AppData\Local\Android\Sdk"
BUILD_TOOLS_DIR = os.path.join(SDK_DIR, "build-tools", "36.0.0")
AAPT2 = os.path.join(BUILD_TOOLS_DIR, "aapt2.exe")
D8 = os.path.join(BUILD_TOOLS_DIR, "d8.bat")
ZIPALIGN = os.path.join(BUILD_TOOLS_DIR, "zipalign.exe")
APKSIGNER = os.path.join(BUILD_TOOLS_DIR, "apksigner.bat")
ANDROID_JAR = os.path.join(SDK_DIR, "platforms", "android-37.0", "android.jar")

KEYSTORE_PATH = os.path.join(PROJECT_DIR, "release.keystore")
KEYSTORE_PASS = "science123"
KEYSTORE_ALIAS = "sciencekey"

os.environ["JAVA_HOME"] = JAVA_HOME
os.environ["PATH"] = os.path.join(JAVA_HOME, "bin") + os.pathsep + os.environ.get("PATH", "")

def run_cmd(cmd, desc):
    print(f"--- Running: {desc} ---")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"FAILED: {desc}")
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)
        sys.exit(1)
    if res.stdout.strip():
        print(res.stdout.strip())
    return res

def main():
    print("Starting Clean Mini Science Lab APK Build...")
    if os.path.exists(BUILD_DIR):
        shutil.rmtree(BUILD_DIR)
    os.makedirs(BUILD_DIR, exist_ok=True)
    
    # 1. Prepare assets directory
    print("Packaging Web Assets...")
    if os.path.exists(ASSETS_DIR):
        shutil.rmtree(ASSETS_DIR)
    os.makedirs(ASSETS_DIR, exist_ok=True)
    
    # Copy web files
    for item in ["index.html", "manifest.json", "sw.js"]:
        src = os.path.join(PROJECT_DIR, item)
        if os.path.exists(src):
            shutil.copy2(src, ASSETS_DIR)
            
    for folder in ["js", "styles", "assets", "audio"]:
        src = os.path.join(PROJECT_DIR, folder)
        dst = os.path.join(ASSETS_DIR, folder)
        if os.path.exists(src):
            shutil.copytree(src, dst)
            
    # Also copy assets to build_out/assets
    build_assets = os.path.join(BUILD_DIR, "assets")
    shutil.copytree(ASSETS_DIR, build_assets)
    
    # 2. Prepare Res Icons
    icon_src = os.path.join(PROJECT_DIR, "assets", "icons", "icon-192.png")
    for density in ["hdpi", "mdpi", "xhdpi", "xxhdpi", "xxxhdpi"]:
        mipmap_dir = os.path.join(RES_DIR, f"mipmap-{density}")
        os.makedirs(mipmap_dir, exist_ok=True)
        if os.path.exists(icon_src):
            shutil.copy2(icon_src, os.path.join(mipmap_dir, "ic_launcher.png"))

    # 3. Compile Resources with aapt2
    compiled_res = os.path.join(BUILD_DIR, "compiled_res.zip")
    run_cmd(f'"{AAPT2}" compile --dir "{RES_DIR}" -o "{compiled_res}"', "AAPT2 Compile Resources")

    # 4. Link Resources with aapt2
    manifest_xml = os.path.join(SRC_MAIN, "AndroidManifest.xml")
    unaligned_apk = os.path.join(BUILD_DIR, "unaligned.apk")
    run_cmd(
        f'"{AAPT2}" link -I "{ANDROID_JAR}" --manifest "{manifest_xml}" -o "{unaligned_apk}" '
        f'"{compiled_res}" -A "{build_assets}" --auto-add-overlay',
        "AAPT2 Link"
    )

    # 5. Compile Java
    classes_dir = os.path.join(BUILD_DIR, "classes")
    os.makedirs(classes_dir, exist_ok=True)
    java_files = []
    for root, _, files in os.walk(os.path.join(SRC_MAIN, "java")):
        for f in files:
            if f.endswith(".java"):
                java_files.append(os.path.join(root, f))
                
    java_args = " ".join([f'"{jf}"' for jf in java_files])
    run_cmd(
        f'"{JAVAC}" -source 17 -target 17 -cp "{ANDROID_JAR}" -d "{classes_dir}" {java_args}',
        "Java Compile"
    )

    # 6. Convert Classes to DEX with d8
    dex_dir = os.path.join(BUILD_DIR, "dex")
    os.makedirs(dex_dir, exist_ok=True)
    
    class_files = []
    for root, _, files in os.walk(classes_dir):
        for f in files:
            if f.endswith(".class"):
                class_files.append(os.path.join(root, f))
                
    class_args = " ".join([f'"{cf}"' for cf in class_files])
    run_cmd(
        f'"{D8}" --output "{dex_dir}" --lib "{ANDROID_JAR}" {class_args}',
        "D8 Dexing"
    )

    # 7. Add classes.dex into unaligned APK
    dex_file = os.path.join(dex_dir, "classes.dex")
    print(f"Adding classes.dex ({os.path.getsize(dex_file)} bytes) to APK...")
    with zipfile.ZipFile(unaligned_apk, "a", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.write(dex_file, "classes.dex")

    # 8. Align APK with zipalign
    aligned_apk = os.path.join(BUILD_DIR, "aligned.apk")
    run_cmd(f'"{ZIPALIGN}" -f -p 4 "{unaligned_apk}" "{aligned_apk}"', "Zipalign")

    # 9. Verify permanent keystore exists
    if not os.path.exists(KEYSTORE_PATH):
        run_cmd(
            f'"{KEYTOOL}" -genkey -v -keystore "{KEYSTORE_PATH}" -storepass {KEYSTORE_PASS} -alias {KEYSTORE_ALIAS} '
            f'-keypass {KEYSTORE_PASS} -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Shivteg,O=MiniScienceLab,C=US"',
            "Generate Permanent Keystore"
        )

    # 10. Sign APK with apksigner
    final_apk = os.path.join(PROJECT_DIR, "MiniScienceLab.apk")
    run_cmd(
        f'"{APKSIGNER}" sign --ks "{KEYSTORE_PATH}" --ks-pass pass:{KEYSTORE_PASS} --ks-key-alias {KEYSTORE_ALIAS} '
        f'--key-pass pass:{KEYSTORE_PASS} --out "{final_apk}" "{aligned_apk}"',
        "APK Signer"
    )

    # 11. Verify APK
    run_cmd(f'"{APKSIGNER}" verify "{final_apk}"', "APK Verify")

    # Copy to standard Android Studio outputs directory as well
    out_dir = os.path.join(APP_DIR, "build", "outputs", "apk", "debug")
    os.makedirs(out_dir, exist_ok=True)
    studio_apk = os.path.join(out_dir, "app-debug.apk")
    shutil.copy2(final_apk, studio_apk)

    # Copy to Desktop with clear names
    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    desktop_apk1 = os.path.join(desktop, "MiniScienceLab.apk")
    desktop_apk2 = os.path.join(desktop, "MiniScienceLab_EDGE_TO_EDGE.apk")
    shutil.copy2(final_apk, desktop_apk1)
    shutil.copy2(final_apk, desktop_apk2)

    # Copy to Downloads
    downloads = os.path.join(os.path.expanduser("~"), "Downloads")
    downloads_apk = os.path.join(downloads, "MiniScienceLab.apk")
    shutil.copy2(final_apk, downloads_apk)

    # Copy to Phone Downloads via CrossDevice if accessible
    phone_download = r"C:\Users\user\CrossDevice\Shivteg's A12 (2)\storage\Download"
    if os.path.exists(phone_download):
        try:
            phone_apk = os.path.join(phone_download, "MiniScienceLab.apk")
            shutil.copy2(final_apk, phone_apk)
            print(f"Copied directly to Phone: {phone_apk}")
        except Exception as e:
            print(f"Could not copy to phone directly: {e}")

    apk_size_mb = os.path.getsize(final_apk) / (1024 * 1024)
    print("========================================")
    print("SUCCESS! APK Built Successfully!")
    print(f"Path: {final_apk}")
    print(f"Desktop Path: {desktop_apk2}")
    print(f"Size: {apk_size_mb:.2f} MB")
    print("========================================")

if __name__ == "__main__":
    main()
