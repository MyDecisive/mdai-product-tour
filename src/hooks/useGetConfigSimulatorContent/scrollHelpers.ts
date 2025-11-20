const SCROLL_PADDING_TOP = 24;

function groupDoesNotNeedScrollPadding(
  groupContainerRect: DOMRect | undefined,
  containerRect: DOMRect
) {
  return (
    groupContainerRect &&
    (Math.abs(groupContainerRect.height - containerRect.height) <
      SCROLL_PADDING_TOP ||
      groupContainerRect.height > containerRect.height)
  );
}

export const calculateScrollTarget = (
  containerRef: HTMLDivElement | null,
  lineNo: number
): number | null => {
  const el = containerRef?.querySelector<HTMLDivElement>(
    `[data-line="${lineNo}"]`
  );

  if (!el || !containerRef) return null;

  const containerRect = containerRef.getBoundingClientRect();
  const elementRect = el.getBoundingClientRect();

  const groupContainerRect = el.parentElement?.getBoundingClientRect();

  if (groupDoesNotNeedScrollPadding(groupContainerRect, containerRect)) {
    return containerRef.scrollTop + (elementRect.top - containerRect.top);
  }

  return (
    containerRef.scrollTop +
    (elementRect.top - containerRect.top) -
    SCROLL_PADDING_TOP
  );
};

export const smoothScrollTo = (
  element: HTMLElement,
  targetTop: number,
  duration: number = 1000
): Promise<void> => {
  let cancelled = false;
  let rafId: number;

  const promise = new Promise<void>((resolve) => {
    const startTop = element.scrollTop;
    const distance = targetTop - startTop;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      if (cancelled) return;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeInOut =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      element.scrollTop = startTop + distance * easeInOut;

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    rafId = requestAnimationFrame(animate);
  });

  (promise as Promise<void> & { cancel: () => void }).cancel = () => {
    cancelled = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };

  return promise;
};
