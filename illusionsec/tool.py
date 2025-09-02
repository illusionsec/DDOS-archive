# (1) AUTOINSTALL MODULE
import os
import sys
import subprocess

REQUIRED_MODULES = ["opencv-python", "numpy", "colorama", "rich", "imageio", "scikit-learn"]
MODULE_IMPORTS = ["cv2", "numpy", "colorama", "rich", "imageio", "sklearn"]

def check_and_install():
    missing = []
    for mod in MODULE_IMPORTS:
        try:
            __import__(mod)
        except ImportError:
            missing.append(mod)
    if missing:
        print("[!] Modul hilang:", ", ".join(missing))
        print("📦 Membuat requirements.txt dan install...")
        with open("requirements.txt", "w") as f:
            for mod in REQUIRED_MODULES:
                f.write(mod + "\n")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("\n✅ Install selesai. Membuka ulang tool...\n")
        os.execv(sys.executable, [sys.executable, os.path.abspath(__file__)] + sys.argv[1:])

check_and_install()

# (2) IMPORT
import cv2
import numpy as np
import time
from colorama import init
from rich.console import Console
import imageio
from sklearn.cluster import KMeans

init(autoreset=True)
console = Console()

VIDEO_EXT = [".mp4", ".avi", ".mov", ".mkv"]
IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp", ".bmp"]
GIF_EXT = [".gif"]

# (3) TOOLS
def resize_frame(frame, width=80):
    h, w, _ = frame.shape
    aspect_ratio = h / w
    height = int(width * aspect_ratio * 0.55)
    if height % 2 == 1:
        height += 1
    return cv2.resize(frame, (width, height))

def apply_color_mode(frame, mode="rgb"):
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    if mode == "sepia":
        sepia_filter = np.array([[0.393, 0.769, 0.189],
                                 [0.349, 0.686, 0.168],
                                 [0.272, 0.534, 0.131]])
        frame = cv2.transform(frame, sepia_filter)
        frame = np.clip(frame, 0, 255).astype(np.uint8)
    elif mode == "gray":
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        frame = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    elif mode == "negative":
        frame = 255 - frame
    return frame

def floyd_steinberg_dither(frame):
    frame = frame.astype(np.float64)
    height, width, _ = frame.shape
    for y in range(height):
        for x in range(width):
            old_pixel = frame[y, x]
            new_pixel = np.round(old_pixel / 255) * 255
            frame[y, x] = new_pixel
            quant_error = old_pixel - new_pixel
            if x + 1 < width:
                frame[y, x + 1] += quant_error * 7 / 16
            if x - 1 >= 0 and y + 1 < height:
                frame[y + 1, x - 1] += quant_error * 3 / 16
            if y + 1 < height:
                frame[y + 1, x] += quant_error * 5 / 16
            if x + 1 < width and y + 1 < height:
                frame[y + 1, x + 1] += quant_error * 1 / 16
    return np.clip(frame, 0, 255).astype(np.uint8)

def get_dominant_colors(frame, n_colors=3):
    pixels = frame.reshape(-1, 3)
    if len(pixels) > 5000:
        indices = np.random.choice(len(pixels), 5000, replace=False)
        pixels = pixels[indices]
    kmeans = KMeans(n_clusters=n_colors, n_init='auto', random_state=42)
    kmeans.fit(pixels)
    return kmeans.cluster_centers_.astype(int)

def convert_frame_to_tfx_style(frame):
    h, w, _ = frame.shape
    if h % 2 == 1:
        frame = frame[:-1]
    top = frame[0::2]
    bottom = frame[1::2]
    result = ""
    for y in range(top.shape[0]):
        for x in range(top.shape[1]):
            r1, g1, b1 = top[y, x]
            r2, g2, b2 = bottom[y, x]
            result += f"\033[38;2;{r1};{g1};{b1}m\033[48;2;{r2};{g2};{b2}m▀"
        result += "\033[0m\n"
    return result

# (4) INTERAKSI
def ask_width():
    console.print("[bold cyan]Pilih lebar output ANSI:[/bold cyan]")
    console.print("1. small  (Putty)   → 60")
    console.print("2. medium (Default) → 80")
    console.print("3. large  (Fullscreen) → 120")
    console.print("4. cmd (Windows Terminal) → 100")
    console.print("5. custom → ketik manual")
    choice = input("Pilih [1-5]: ").strip()
    if choice == "1": return 60
    elif choice == "2": return 80
    elif choice == "3": return 120
    elif choice == "4": return 100
    elif choice == "5":
        while True:
            try: return int(input("Masukkan width: "))
            except ValueError: print("⚠️  Harus angka.")
    return 80

def ask_color_mode():
    console.print("[bold cyan]Pilih mode warna:[/bold cyan]")
    console.print("1. RGB (Default)")
    console.print("2. Sepia")
    console.print("3. Grayscale")
    console.print("4. Negative")
    return {
        "1": "rgb", "2": "sepia", "3": "gray", "4": "negative"
    }.get(input("Pilih [1-4]: ").strip(), "rgb")

def ask_use_dither():
    return input("Gunakan dithering Floyd–Steinberg? [y/N]: ").strip().lower() in ["y", "yes"]

def terminal_preview_all(frames):
    console.print("\n[bold green]Preview semua frame di terminal:[/bold green] (tekan CTRL+C untuk skip)")
    try:
        for frame in frames:
            print("\033c" + frame)
            time.sleep(0.03)
    except KeyboardInterrupt:
        pass
    confirm = input("\n[?] Lanjut convert dan simpan ke .tfx? [Y/n]: ").strip().lower()
    return confirm in ["", "y", "yes"]

# (5) KONVERSI UTAMA
def convert_to_tfx(path, width=None, output_dir="output_tfx", color_mode="rgb", use_dither=False):
    ext = os.path.splitext(path)[1].lower()
    if width is None: width = ask_width()
    if not os.path.exists(path):
        console.print(f"[red]File tidak ditemukan: {path}[/red]")
        sys.exit(1)

    basename = os.path.splitext(os.path.basename(path))[0]
    os.makedirs(output_dir, exist_ok=True)
    tfx_path = os.path.join(output_dir, f"{basename}.tfx.txt")
    frames = []

    def process_frame(frame):
        frame = apply_color_mode(frame, color_mode)
        if use_dither: frame = floyd_steinberg_dither(frame)
        dominants = get_dominant_colors(frame)
        console.print(f"Dominant colors: {', '.join([str(tuple(c)) for c in dominants])}")
        return convert_frame_to_tfx_style(resize_frame(frame, width))

    if ext in GIF_EXT:
        gif = imageio.mimread(path)
        for img in gif:
            frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            frames.append(process_frame(frame))
    elif ext in VIDEO_EXT:
        cap = cv2.VideoCapture(path)
        while True:
            ret, frame = cap.read()
            if not ret: break
            frames.append(process_frame(frame))
        cap.release()
    elif ext in IMAGE_EXT:
        img = cv2.imread(path)
        if img is None:
            console.print(f"[red]Gagal membaca gambar: {path}[/red]")
            sys.exit(1)
        frames.append(process_frame(img))
    else:
        console.print(f"[red]Format file tidak didukung: {ext}[/red]")
        console.print("[yellow]Support: .gif, .mp4, .png, .jpg, .jpeg, .webp, .bmp[/yellow]")
        sys.exit(1)

    if not terminal_preview_all(frames):
        console.print("[yellow]Konversi dibatalkan.[/yellow]")
        return

    with open(tfx_path, "w", encoding="utf-8") as f:
        for ansi in frames:
            f.write("\033c\033[?25l" + ansi)

    console.print(f"\n[green]✓ .tfx berhasil disimpan:[/green] {tfx_path}")
    console.print(f"[blue]Frame total:[/blue] {len(frames)}")

# (6) MAIN
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Convert video/gif/gambar ke ANSI .tfx format (▀ style)")
    parser.add_argument("input", nargs="?", help="Path file input (.gif/.mp4/.png)")
    parser.add_argument("--width", type=int, help="Lebar output (optional)")
    parser.add_argument("--output", default="output_tfx", help="Folder output")
    args = parser.parse_args()

    if not args.input:
        args.input = input("Masukkan path file (mp4/gif/png): ").strip()
    color_mode = ask_color_mode()
    use_dither = ask_use_dither()
    convert_to_tfx(args.input, width=args.width, output_dir=args.output, color_mode=color_mode, use_dither=use_dither)
