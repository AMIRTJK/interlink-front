import { useState, useRef, useEffect } from 'react';
import { ISubOrganization } from './model';

export function calcOrgTotals(org: ISubOrganization) {
  let slots = 0,
    occupied = 0,
    vacant = 0,
    fot = 0;
  org.departments.forEach((d) => {
    d.positions.forEach((p) => {
      slots += p.slots;
      occupied += p.occupied;
      vacant += p.vacant;
      fot += p.salary * p.slots;
    });
  });
  return {
    slots,
    occupied,
    vacant,
    fot,
    positions: org.departments.reduce((s, d) => s + d.positions.length, 0),
  };
}

export function getOccupancyColor(pct: number) {
  if (pct >= 100)
    return {
      bar: 'from-emerald-400 to-emerald-500',
      text: 'text-emerald-600',
      darkText: 'text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700',
      darkBadge: 'bg-emerald-900/30 text-emerald-400',
    };
  if (pct >= 60)
    return {
      bar: 'from-indigo-400 to-indigo-500',
      text: 'text-indigo-600',
      darkText: 'text-indigo-400',
      badge: 'bg-indigo-100 text-indigo-700',
      darkBadge: 'bg-indigo-900/30 text-indigo-400',
    };
  if (pct >= 30)
    return {
      bar: 'from-amber-400 to-amber-500',
      text: 'text-amber-600',
      darkText: 'text-amber-400',
      badge: 'bg-amber-100 text-amber-700',
      darkBadge: 'bg-amber-900/30 text-amber-400',
    };
  return {
    bar: 'from-red-400 to-rose-500',
    text: 'text-rose-600',
    darkText: 'text-rose-400',
    badge: 'bg-rose-100 text-rose-700',
    darkBadge: 'bg-rose-900/30 text-rose-400',
  };
}

export function useAnimatedCounter(target: number, duration = 900, startDelay = 0) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setCount(0);
    startTimeRef.current = null;
    const timeout = setTimeout(() => {
      const animate = (ts: number) => {
        if (!startTimeRef.current) startTimeRef.current = ts;
        const elapsed = ts - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      };
      frameRef.current = requestAnimationFrame(animate);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, startDelay]);

  return count;
}
