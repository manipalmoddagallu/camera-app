import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';

const adjustVideoBrightnessContrast = async (
  selectedVideo,
  brightness,
  contrast,
  temperature,
  sharpness
) => {
  console.log('Adjusting video:', selectedVideo);
  return new Promise(async (resolve, reject) => {
    if (!selectedVideo) {
      reject('Invalid selected video.');
      return;
    }

    const originalVideoUri = selectedVideo;
    const outputFileName = `adjusted_${new Date().getTime()}.mp4`;
    const outputVideoPath = `${RNFS.CachesDirectoryPath}/${outputFileName}`;
    console.log('Output path:', outputVideoPath);

    // Calculate adjustment factors
    const brightnessFactor = (brightness - 1) * 0.5; // Range: -0.5 to 0.5
    const contrastFactor = contrast; // Range: 0 to 2
    const temperatureFactor = (temperature - 1) * 1000; // Adjust this as needed for your effect
    const sharpnessFactor = sharpness; // Range: 0 to 10

    // Construct FFmpeg command
    const ffmpegCommand = `-i "${originalVideoUri}" -vf "eq=brightness=${brightnessFactor}:contrast=${contrastFactor},curves=blue='0/0 0.5/${0.5 - temperatureFactor/10000} 1/1',unsharp=5:5:${sharpnessFactor}" -c:a copy "${outputVideoPath}"`;
    console.log('FFmpeg command:', ffmpegCommand);

    try {
      const session = await FFmpegKit.execute(ffmpegCommand);
      const returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        console.log('Video adjustment completed successfully.');
        resolve(`file://${outputVideoPath}`);
      } else {
        console.error(`Video adjustment failed with return code: ${returnCode}`);
        const output = await session.getOutput();
        reject(`Video adjustment failed. Output: ${output}`);
      }
    } catch (error) {
      console.error(`Error executing FFmpeg command: ${error}`);
      reject(`Error executing FFmpeg command: ${error}`);
    }
  });
};

export default adjustVideoBrightnessContrast;
