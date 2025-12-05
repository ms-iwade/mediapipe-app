import { useRef, useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useGestureRecognizer } from "../hooks/useGestureRecognizer";
import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";

// 手の骨格接続定義 (簡易版)
const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // Thumb
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // Index
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12], // Middle
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16], // Ring
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20], // Pinky
  [5, 9],
  [9, 13],
  [13, 17], // Palm
];

interface WebcamViewProps {
  onGestureDetected: (gestureName: string) => void;
}

export const WebcamView = ({ onGestureDetected }: WebcamViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const { isLoaded, result, recognize, error } = useGestureRecognizer();

  // カメラのセットアップ
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            setIsCameraReady(true);
            videoRef.current?.play();
          };
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startCamera();

    return () => {
      // クリーンアップ：ストリームの停止
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 認識と描画のループ
  const animate = () => {
    if (videoRef.current && canvasRef.current && isLoaded && isCameraReady) {
      // ビデオの準備確認
      if (videoRef.current.readyState >= 2) {
        // 認識実行
        const recognitionResult = recognize(videoRef.current);

        // 描画
        if (recognitionResult) {
          drawResults(recognitionResult);
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    }
  };

  // 結果の処理と描画
  useEffect(() => {
    if (isLoaded && isCameraReady) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isLoaded, isCameraReady]); // recognizeは依存に含めない（無限ループ防止）

  // 結果変更時のコールバック呼び出し
  useEffect(() => {
    if (result && result.gestures.length > 0) {
      // 最も確信度の高いジェスチャーを通知
      const topGesture = result.gestures[0][0];
      if (topGesture) {
        onGestureDetected(topGesture.categoryName);
      }
    } else {
      onGestureDetected("None");
    }
  }, [result, onGestureDetected]);

  const drawResults = (result: GestureRecognizerResult) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !result) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // キャンバスサイズをビデオに合わせる
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (result.landmarks && result.gestures) {
      // 手の骨格を描画
      for (let i = 0; i < result.landmarks.length; i++) {
        const landmarks = result.landmarks[i];

        // 接続線の描画
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#FFFFFF";

        for (const [start, end] of HAND_CONNECTIONS) {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];

          ctx.beginPath();
          ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
          ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
          ctx.stroke();
        }

        // ポイントの描画
        ctx.fillStyle = "#FFA500";
        for (const landmark of landmarks) {
          ctx.beginPath();
          ctx.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            4,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      }
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 2, color: "error.main" }}>
        <Typography>エラーが発生しました: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        bgcolor: "black",
      }}
    >
      {!isLoaded && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <CircularProgress />
          <Typography variant="caption" display="block">
            モデル読み込み中...
          </Typography>
        </Box>
      )}

      <video
        ref={videoRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          transform: "scaleX(-1)", // 鏡像反転
          objectFit: "contain", // 全体表示（レターボックス許容）
        }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: "scaleX(-1)", // 鏡像反転（描画も合わせる）
          objectFit: "contain",
        }}
      />

      {/* HTML Overlay for Labels */}
      {result?.landmarks.map((landmarks, i) => {
        const gesture = result.gestures[i]?.[0];
        if (!gesture) return null;

        let minX = Infinity;
        let minY = Infinity;

        for (const landmark of landmarks) {
          if (landmark.x < minX) minX = landmark.x;
          if (landmark.y < minY) minY = landmark.y;
        }

        const gestureName = gesture.categoryName.replace(/_/g, " ");
        const score = Math.round(gesture.score * 100);

        // Calculate position
        // X: Mirror effect means (1 - x)
        // Y: Normal
        const left = `${(1 - minX) * 100}%`;
        const top = `${Math.max(0, minY * 100 - 5)}%`; // 5% above hand

        return (
          <Box
            key={i}
            sx={{
              position: "absolute",
              left: left,
              top: top,
              transform: "translateX(-50%)", // Center text
              bgcolor: "rgba(0, 0, 0, 0.7)",
              color: "#00FFFF",
              padding: "4px 8px",
              borderRadius: "4px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 20,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
            >
              {gestureName}{" "}
              <Typography component="span" variant="body2">
                ({score}%)
              </Typography>
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
