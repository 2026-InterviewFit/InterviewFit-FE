import fixWebmDuration from "fix-webm-duration";

export function getSupportedWebmMimeType(): string {
  return MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
    ? "video/webm;codecs=vp8,opus"
    : "video/webm";
}

export function fixWebmBlobDuration(blob: Blob, durationMs: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    fixWebmDuration(blob, durationMs, (fixedBlob: Blob) => {
      if (fixedBlob) resolve(fixedBlob);
      else reject(new Error("영상 길이 정보 복구에 실패했습니다."));
    });
  });
}
