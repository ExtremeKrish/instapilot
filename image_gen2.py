from PIL import Image, ImageDraw, ImageFont
import os
import config
import re

# Default theme dictionary
DEFAULT_THEME = {
    "font": "Nregular.otf",
    "bold_font": "nbold.otf",
    "text_size": 140,
    "bg_image": "white.png",
    "text_color": "#000000",
    "text_wrap_length": 30,
    "text_x": 400,
    "line_spacing": 2,
    "highlight_bg_color": "#FFFF00",  # Yellow background for highlights
    "highlight_text_color": "#000000",  # Black text for highlights
    "highlight_padding": 5  # Padding around highlighted text
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
    
    # Convert hex colors to RGB tuples
    hex_color = theme["text_color"].lstrip("#")
    text_color = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    highlight_bg_color = tuple(int(theme["highlight_bg_color"].lstrip("#")[i:i+2], 16) for i in (0, 2, 4))
    highlight_text_color = tuple(int(theme["highlight_text_color"].lstrip("#")[i:i+2], 16) for i in (0, 2, 4))
    
    # Load fonts
    font = ImageFont.truetype(os.path.join("fonts", theme["font"]), theme["text_size"])
    bold_font = ImageFont.truetype(os.path.join("fonts", theme["bold_font"]), theme["text_size"])
    
    def get_styled_text(line):
        segments = []
        # Split line on [] brackets while keeping the brackets and content
        parts = re.split(r'(\[.*?\])', line)
        for part in parts:
            if part.startswith('[') and part.endswith(']') and len(part) > 2:
                segments.append({"text": part[1:-1], "font": font, "highlight": True})
            elif part.startswith("*") and part.endswith("*") and len(part) > 2:
                segments.append({"text": part[1:-1], "font": bold_font, "highlight": False})
            else:
                segments.append({"text": part, "font": font, "highlight": False})
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
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            if segment["highlight"]:
                # Draw highlight background
                draw.rectangle(
                    (
                        x - theme["highlight_padding"],
                        y - theme["highlight_padding"],
                        x + text_width + theme["highlight_padding"],
                        y + text_height + theme["highlight_padding"]
                    ),
                    fill=highlight_bg_color
                )
                # Draw highlighted text
                draw.text((x, y), segment["text"], font=segment["font"], fill=highlight_text_color)
            else:
                # Draw regular or bold text
                draw.text((x, y), segment["text"], font=segment["font"], fill=text_color)
            
            x += text_width
        
        y += line_height * line_spacing
    
    # Save image
    image.save(output_path, "PNG")
    return output_path

if __name__ == "__main__":
    sample_text = "Hello *World*! This is a [test] of the image generator."
    output_file = "sample_output.png"
    generate_image(sample_text, output_path=output_file)
    print(f"Image generated and saved as {output_file}")