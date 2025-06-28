import math

# Convert a hex color to an RGB tuple
def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

# Interpolate between two colors given t from 0.0 to 1.0
def interpolate_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

# Generate a gradient with a total number of steps between a list of RGB colors
def generate_gradient(colors, steps):
    if steps <= 1:
        return [colors[0]] * steps

    gradient = []
    segments = len(colors) - 1
    steps_per_segment = steps / segments

    for seg in range(segments):
        start = colors[seg]
        end = colors[seg + 1]
        for step in range(int(math.ceil(steps_per_segment))):
            t = step / steps_per_segment
            gradient.append(interpolate_color(start, end, t))
            if len(gradient) >= steps:
                break
        if len(gradient) >= steps:
            break

    while len(gradient) < steps:
        gradient.append(colors[-1])
    return gradient

# Wrap each character with its corresponding ANSI escape sequence for the color
def apply_gradient_to_text(text, gradient, esc):
    colored_text = ""
    for char, color in zip(text, gradient):
        colored_text += f"{esc}[38;2;{color[0]};{color[1]};{color[2]}m{char}{esc}[39m"
    return colored_text

# Process a single line with a horizontal (left-to-right) gradient
def process_line_gradient(line, colors, esc):
    steps = len(line)
    rgb_colors = [hex_to_rgb(c) for c in colors]
    gradient = generate_gradient(rgb_colors, steps)
    return apply_gradient_to_text(line, gradient, esc)

def main():
    # Ask for the escape code and convert escape sequences
    user_esc = input("Enter escape type (default \\x1b): ") or "\\x1b"
    esc = bytes(user_esc, "utf-8").decode("unicode_escape")

    # Gradient choice menu
    print("\nChoose gradient direction:")
    print("1. Left to Right")
    print("2. Top to Bottom")
    print("3. Both (L-R + T-B)")
    
    choice = input("Enter 1, 2, or 3: ").strip()

    # Define the gradient hex colors
    colors = ['#c62828', '#CC0033', '#c0392b']

    # Read the input file
    try:
        with open("input.txt", "r", encoding="utf-8") as f:
            lines = f.readlines()
    except FileNotFoundError:
        print("Error: input.txt not found!")
        return

    output_lines = []
    if choice == "1":
        # Apply a left-to-right gradient on each line individually
        for line in lines:
            line = line.rstrip("\n")
            output_lines.append(process_line_gradient(line, colors, esc))
    elif choice == "2":
        # Apply a vertical gradient: each line gets one color
        total_lines = len(lines)
        rgb_colors = [hex_to_rgb(c) for c in colors]
        vert_gradient = generate_gradient(rgb_colors, total_lines)
        for i, line in enumerate(lines):
            line = line.rstrip("\n")
            color = vert_gradient[i]
            colored_line = f"{esc}[38;2;{color[0]};{color[1]};{color[2]}m{line}{esc}[39m"
            output_lines.append(colored_line)
    elif choice == "3":
        # Apply both horizontal and vertical gradients
        total_lines = len(lines)
        rgb_colors_vert = [hex_to_rgb(c) for c in colors]
        vert_gradient = generate_gradient(rgb_colors_vert, total_lines)
        for i, line in enumerate(lines):
            line = line.rstrip("\n")
            rgb_colors_horiz = [hex_to_rgb(c) for c in colors]
            horiz_gradient = generate_gradient(rgb_colors_horiz, len(line))
            combined_gradient = []
            for horiz_color in horiz_gradient:
                combined = tuple((h + v) // 2 for h, v in zip(horiz_color, vert_gradient[i]))
                combined_gradient.append(combined)
            output_lines.append(apply_gradient_to_text(line, combined_gradient, esc))
    else:
        print("Invalid choice! Please select 1, 2, or 3.")
        return

    # Write to output.txt
    with open("output.txt", "w", encoding="utf-8") as f:
        for line in output_lines:
            f.write(line + "\n")

    print("Gradient colored text written to output.txt")

if __name__ == "__main__":
    main()