#!/bin/bash
# Video compression script for Urban Jungle project
# Compresses large video files to reduce size for git

echo "🎬 Starting video compression..."
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed!"
    echo "📦 Install it with: brew install ffmpeg"
    exit 1
fi

# Create compressed directory
COMPRESSED_DIR="src/assets/videos/compressed"
mkdir -p "$COMPRESSED_DIR"

# Compression settings
# Target: Under 10MB per video, good quality
QUALITY="23"  # Lower = better quality (18-28 is good range)
RESOLUTION="1280:720"  # 720p (can change to 1920:1080 for 1080p)
BITRATE="2M"  # Video bitrate
AUDIO_BITRATE="128k"  # Audio bitrate

compress_video() {
    local input="$1"
    local filename=$(basename "$input")
    local output="$COMPRESSED_DIR/${filename%.*}-compressed.mp4"
    
    echo "📹 Compressing: $filename"
    echo "   Input size: $(du -h "$input" | cut -f1)"
    
    ffmpeg -i "$input" \
        -vf "scale=$RESOLUTION:force_original_aspect_ratio=decrease" \
        -c:v libx264 \
        -crf $QUALITY \
        -b:v $BITRATE \
        -maxrate $BITRATE \
        -bufsize $((BITRATE * 2)) \
        -c:a aac \
        -b:a $AUDIO_BITRATE \
        -movflags +faststart \
        -y "$output" 2>&1 | grep -E "(Duration|Stream|Output|error)" || true
    
    if [ -f "$output" ]; then
        echo "   ✅ Output size: $(du -h "$output" | cut -f1)"
        echo "   📁 Saved to: $output"
        echo ""
    else
        echo "   ❌ Compression failed!"
        echo ""
    fi
}

# Compress large files first
echo "🔴 Compressing large files (>10MB)..."
echo ""

# Airmax.mp4 (85MB)
if [ -f "src/assets/videos/Airmax.mp4" ]; then
    compress_video "src/assets/videos/Airmax.mp4"
fi

# jordan.mp4 (20MB)
if [ -f "src/assets/videos/jordan.mp4" ]; then
    compress_video "src/assets/videos/jordan.mp4"
fi

# Compress medium files (optional)
echo "🟡 Compressing medium files (5-10MB)..."
echo ""

# 3dairforcebuttonshow.mp4 (7MB)
if [ -f "src/assets/videos/3dairforcebuttonshow.mp4" ]; then
    compress_video "src/assets/videos/3dairforcebuttonshow.mp4"
fi

# Nikebarcode.mp4 (5.1MB)
if [ -f "src/assets/videos/Nikebarcode.mp4" ]; then
    compress_video "src/assets/videos/Nikebarcode.mp4"
fi

# Nikeloadingscreen.mp4 (3.9MB)
if [ -f "src/assets/videos/Nikeloadingscreen.mp4" ]; then
    compress_video "src/assets/videos/Nikeloadingscreen.mp4"
fi

echo "✅ Compression complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review compressed files in: $COMPRESSED_DIR"
echo "2. Replace original files if quality is acceptable:"
echo "   mv $COMPRESSED_DIR/*-compressed.mp4 src/assets/videos/"
echo "3. Update code references if filenames changed"
echo "4. Add to git: git add src/assets/videos/*.mp4"




