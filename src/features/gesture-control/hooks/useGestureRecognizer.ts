import { useEffect, useRef, useState, useCallback } from "react";
import {
  GestureRecognizer,
  FilesetResolver,
  type GestureRecognizerResult,
} from "@mediapipe/tasks-vision";

// ジェスチャー認識モデルのパス
// Googleの公開モデルを使用
const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

export const useGestureRecognizer = () => {
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [result, setResult] = useState<GestureRecognizerResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // モデルの初期化
  useEffect(() => {
    const loadModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        gestureRecognizerRef.current =
          await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_PATH,
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numHands: 2,
          });

        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load gesture recognizer:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    };

    loadModel();
  }, []);

  // ビデオフレームからの認識処理
  const recognize = useCallback(
    (video: HTMLVideoElement) => {
      if (!gestureRecognizerRef.current || !isLoaded) return;

      // ビデオの準備ができているか確認
      if (
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      try {
        // VIDEOモードの場合はtimestampが必要
        const nowInMs = Date.now();
        const recognitionResult =
          gestureRecognizerRef.current.recognizeForVideo(video, nowInMs);

        setResult(recognitionResult);
        return recognitionResult;
      } catch (err) {
        console.error("Error during recognition:", err);
        return null;
      }
    },
    [isLoaded]
  );

  return {
    isLoaded,
    result,
    recognize,
    error,
  };
};
