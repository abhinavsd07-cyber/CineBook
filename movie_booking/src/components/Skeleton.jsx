import React from "react";

export default function Skeleton({ type = "text", width, height, className = "" }) {
  const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-800";
  let typeClasses = "rounded";
  
  if (type === "rect") {
    typeClasses = "w-full aspect-[2/3] rounded-lg";
  } else if (type === "title") {
    typeClasses = "h-5 mt-3 mb-1.5 w-[80%]";
  } else if (type === "text") {
    typeClasses = "h-3.5 w-[60%]";
  } else if (type === "circle") {
    typeClasses = "rounded-full";
  }

  const classes = `${baseClasses} ${typeClasses} ${className}`;
  const style = { width, height };

  return <div className={classes} style={style}></div>;
}

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col w-[220px]">
      <Skeleton type="rect" className="w-full" />
      <Skeleton type="title" className="h-5 mt-3 mb-1.5" />
      <Skeleton type="text" className="h-3.5" />
    </div>
  );
}
