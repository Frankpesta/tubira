"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { ReactNode } from "react";

export const AceternityCard = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/card relative h-full w-full rounded-xl border border-black/[0.1] bg-white dark:border-white/[0.2] dark:bg-black",
        className
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl">
        {children}
      </div>
    </div>
  );
};

export const CardBody = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div className={cn("relative z-10 p-6", className)}>{children}</div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  href,
  className,
  children,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  ...rest
}: {
  as?: React.ElementType;
  href?: string;
  className?: string;
  children: ReactNode;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number;
  rotateY?: number;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <Tag
      className={cn(
        "group-hover/card:translate-x-[7px] group-hover/card:translate-y-[7px] group-hover/card:rotate-[2deg] transition-transform duration-300",
        className
      )}
      style={{
        transform: `translateX(${translateX}) translateY(${translateY}) translateZ(${translateZ}) rotateX(${rotateX}) rotateY(${rotateY})`,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export const CardImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-transform duration-300 group-hover/card:scale-110",
          className
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
    </div>
  );
};

