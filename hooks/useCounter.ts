"use client";

import { useEffect, useState } from "react";

interface UseCounterOptions {
  target: number;       // 도달할 목표 숫자
  duration?: number;    // 애니메이션 시간 (ms)
  delay?: number;       // 시작 전 대기 (ms)
  decimals?: number;    // 소수점 자리수
}

export function useCounter({
  target,
  duration = 1800,
  delay = 0,
  decimals = 0,
}: UseCounterOptions) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId: number;
    let startTime: number | null = null;

    const timeoutId = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(target * eased);

        if (progress < 1) {
          frameId = requestAnimationFrame(animate);
        } else {
          setValue(target);
        }
      };

      frameId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target, duration, delay]);

  // 소수점 처리
  return decimals > 0
    ? value.toFixed(decimals)
    : Math.floor(value).toLocaleString();
}