import { useState, useRef, useEffect } from "react";
import { DragInfo } from "./bookModalModel";

export const useBookDragAndZoom = () => {
  const [scale, setScale] = useState(1.0);
  const [zoomInput, setZoomInput] = useState("100");

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<DragInfo>({
    isDown: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  useEffect(() => {
    setZoomInput(String(Math.round(scale * 100)));
  }, [scale]);

  const adjustZoom = (delta: number) => {
    let newPercent = Math.round(scale * 10) * 10;
    newPercent += delta * 100;
    if (newPercent < 20) newPercent = 20;
    if (newPercent > 300) newPercent = 300;
    setScale(newPercent / 100);
  };

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomInput(e.target.value);
  };

  const commitZoom = () => {
    let percent = parseInt(zoomInput);

    if (isNaN(percent)) {
      setZoomInput(String(Math.round(scale * 100)));
      return;
    }

    if (percent < 20) percent = 20;
    if (percent > 300) percent = 300;

    setScale(percent / 100);
    setZoomInput(String(percent));
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitZoom();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (
      clientX > viewportRef.current.clientWidth ||
      clientY > viewportRef.current.clientHeight
    )
      return;

    dragInfo.current = {
      isDown: true,
      startX: e.pageX - viewportRef.current.offsetLeft,
      startY: e.pageY - viewportRef.current.offsetTop,
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop,
    };
    viewportRef.current.classList.add("grabbing");
    document.body.style.userSelect = "none";
  };

  const stopDrag = () => {
    dragInfo.current.isDown = false;
    if (viewportRef.current) viewportRef.current.classList.remove("grabbing");
    document.body.style.userSelect = "";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const isOverScroll =
      e.clientX - rect.left > viewportRef.current.clientWidth ||
      e.clientY - rect.top > viewportRef.current.clientHeight;
    viewportRef.current.style.cursor = isOverScroll
      ? "default"
      : dragInfo.current.isDown
        ? "grabbing"
        : "grab";

    if (!dragInfo.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - viewportRef.current.offsetLeft;
    const y = e.pageY - viewportRef.current.offsetTop;
    const walkX = x - dragInfo.current.startX;
    const walkY = y - dragInfo.current.startY;
    viewportRef.current.scrollLeft = dragInfo.current.scrollLeft - walkX;
    viewportRef.current.scrollTop = dragInfo.current.scrollTop - walkY;
  };

  return {
    scale,
    setScale,
    zoomInput,
    viewportRef,
    adjustZoom,
    handleZoomInputChange,
    commitZoom,
    handleZoomInputKeyDown,
    handleMouseDown,
    stopDrag,
    handleMouseMove,
  };
};
