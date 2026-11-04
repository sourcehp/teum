"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { PublicImage } from "@/lib/data/public";

export function Gallery({ images, title }: { images: PublicImage[]; title: string }) {
  const [index, setIndex] = useState(-1);
  if (images.length === 0) return null;
  return (
    <>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <li key={img.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${img.alt || title} 사진 확대 보기`}
              className="relative block aspect-[4/3] w-full overflow-hidden bg-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <Image
                src={img.url}
                alt={img.alt || title}
                fill
                sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={images.map((img) => ({
          src: img.url,
          alt: img.alt || title,
          width: img.width,
          height: img.height,
        }))}
      />
    </>
  );
}
