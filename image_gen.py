from PIL import Image, ImageDraw, ImageFont
import os
import config

# Default theme dictionary
DEFAULT_THEME = {
    "font": "Nregular.otf",
    "bold_font": "nbold.otf",
    "text_size": 140,
    "bg_image": "white.png",
    "text_color": "#000000",
    "text_wrap_length": 40,
    "text_x": 400,
    "line_spacing": 2
}

def generate_image(text: str, theme: dict = None, output_path: str = "output.png") -> str:
    # Use default theme if none provided
    theme = theme or DEFAULT_THEME
    
    # Load background image from specified path
    bg_path = os.path.join("bg_images", theme["bg_image"])
    background = Image.open(bg_path).convert("RGB")
    width, height = background.size
    
    # Create new image with background
    image = Image.new("RGB", (width, height))
    image.paste(background)
    draw = ImageDraw.Draw(image)
    
    # Convert hex color to RGB tuple
    hex_color = theme["text_color"].lstrip("#")
    text_color = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    # Load fonts
    font = ImageFont.truetype(os.path.join("fonts", theme["font"]), theme["text_size"])
    bold_font = ImageFont.truetype(os.path.join("fonts", theme["bold_font"]), theme["text_size"])
    
    def get_styled_text(line):
        segments = []
        tokens = []
        current = ""
        i = 0
        while i < len(line):
            if line[i] == "*" and i + 1 < len(line) and line[i + 1] != "*":
                if current:
                    tokens.append(current)
                current = "*"
                i += 1
                while i < len(line) and line[i] != "*":
                    current += line[i]
                    i += 1
                if i < len(line):
                    current += "*"
                tokens.append(current)
                current = ""
            else:
                current += line[i]
            i += 1
        if current:
            tokens.append(current)
        
        for token in tokens:
            if token.startswith("*") and token.endswith("*") and len(token) > 2:
                segments.append({"text": token[1:-1], "font": bold_font})
            else:
                segments.append({"text": token, "font": font})
        return segments
    
    # Split text into lines with wrapping
    lines = []
    paragraphs = text.split("\n")
    for paragraph in paragraphs:
        if not paragraph.strip():
            lines.append("")
            continue
        words = paragraph.split()
        current_line = ""
        for word in words:
            if len(current_line) + len(word) + (1 if current_line else 0) <= theme["text_wrap_length"]:
                current_line += (" " if current_line else "") + word
            else:
                if current_line:
                    lines.append(current_line)
                if len(word) > theme["text_wrap_length"]:
                    while len(word) > theme["text_wrap_length"]:
                        lines.append(word[:theme["text_wrap_length"]])
                        word = word[theme["text_wrap_length"]:]
                    if word:
                        current_line = word
                    else:
                        current_line = ""
                else:
                    current_line = word
        if current_line:
            lines.append(current_line)
    
    # Calculate text block dimensions
    bbox = font.getbbox("A")
    line_height = bbox[3] - bbox[1]
    line_spacing = theme["line_spacing"]
    text_block_height = len(lines) * line_height * line_spacing - (line_spacing - 1) * line_height
    
    # Center text vertically
    y = (height - text_block_height) // 2
    
    # Draw text
    for line in lines:
        styled_segments = get_styled_text(line)
        if styled_segments:
            total_width = sum(segment["font"].getbbox(segment["text"])[2] - segment["font"].getbbox(segment["text"])[0] for segment in styled_segments)
        else:
            total_width = 0
        
        x = theme["text_x"]
        
        for segment in styled_segments:
            bbox = segment["font"].getbbox(segment["text"])
            draw.text((x, y), segment["text"], font=segment["font"], fill=text_color)
            x += bbox[2] - bbox[0]
        
        y += line_height * line_spacing
    
    # Save image
    image.save(output_path, "PNG")
    return output_path