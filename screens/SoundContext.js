import React, { createContext, useState, useCallback, useRef } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Sound from 'react-native-sound';

export const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [recordSound, setRecordSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  const stopSound = useCallback(() => {
    if (sound) {
      sound.stop(() => {
        setIsPlaying(false);
        setSound(null);
      });
    }
  }, [sound]);

  const onRecordStopPlay = useCallback(async () => {
    if (isPlaying) {
      try {
        await audioRecorderPlayer.stopPlayer();
        console.log('Stopped playing');
        setIsPlaying(false);
      } catch (error) {
        console.error('Error stopping playback:', error);
      }
    } else {
      console.warn('Audio is not playing');
    }
  }, [isPlaying, audioRecorderPlayer]);

  const startRecording = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.startRecorder();
      setRecordSound(result);
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [audioRecorderPlayer]);

  const stopRecording = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setRecordSound(null);
      setAudioFile(result);
      setIsRecording(false);
      console.log('Recording stopped');
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }, [audioRecorderPlayer]);

  const startPlaying = useCallback(async (audioPath) => {
    if (audioPath || audioFile) {
      try {
        const filePath = audioPath || audioFile;
        await audioRecorderPlayer.startPlayer(filePath);
        setIsPlaying(true);
        console.log('Started playing');

        audioRecorderPlayer.addPlayBackListener((e) => {
          if (e.currentPosition === e.duration) {
            console.log('Finished playing');
            setIsPlaying(false);
            audioRecorderPlayer.removePlayBackListener();
          }
        });
      } catch (error) {
        console.error('Error starting playback:', error);
      }
    } else {
      console.warn('No audio file to play');
    }
  }, [audioFile, audioRecorderPlayer]);

  const pausePlaying = useCallback(async () => {
    try {
      await audioRecorderPlayer.pausePlayer();
      setIsPlaying(false);
      console.log('Paused playing');
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  }, [audioRecorderPlayer]);

  const resumePlaying = useCallback(async () => {
    try {
      await audioRecorderPlayer.resumePlayer();
      setIsPlaying(true);
      console.log('Resumed playing');
    } catch (error) {
      console.error('Error resuming playback:', error);
    }
  }, [audioRecorderPlayer]);

  return (
    <SoundContext.Provider
      value={{
        sound,
        setSound,
        isPlaying,
        setIsPlaying,
        stopSound,
        recordSound,
        setRecordSound,
        onRecordStopPlay,
        setAudioFile,
        startRecording,
        stopRecording,
        startPlaying,
        pausePlaying,
        resumePlaying,
        audioFile,
        isRecording,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};