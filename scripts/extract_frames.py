import os
import cv2

video_path = r"c:\Users\CHINMAYA M\Downloads\SareeVanta\Silk_saree_unfolding_in_studio_202608201236.mp4"
output_dir = r"c:\Users\CHINMAYA M\Downloads\SareeVanta\public\hero-sequence"

os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print(f"Total video frames: {total_frames}, FPS: {fps}, Dimensions: {width}x{height}")

TARGET_FRAMES = 90
frame_indices = [int(i * (total_frames - 1) / (TARGET_FRAMES - 1)) for i in range(TARGET_FRAMES)]

saved_count = 0
for idx, target_frame_num in enumerate(frame_indices):
    cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame_num)
    ret, frame = cap.read()
    if not ret:
        print(f"Failed to read frame at index {target_frame_num}")
        continue
    
    target_width = 1600
    if width > target_width:
        target_height = int(height * (target_width / width))
        frame_resized = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_AREA)
    else:
        frame_resized = frame

    frame_filename = f"frame_{idx + 1:03d}.webp"
    output_path = os.path.join(output_dir, frame_filename)
    
    cv2.imwrite(output_path, frame_resized, [cv2.IMWRITE_WEBP_QUALITY, 82])
    saved_count += 1

cap.release()
print(f"Successfully extracted and saved {saved_count} WebP frames to {output_dir}")
