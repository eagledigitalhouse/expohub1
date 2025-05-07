import { useState } from "react";
import { ContentBlock, VideoContent } from "@shared/schema";
import { Play } from "lucide-react";

interface VideoBlockProps {
  block: ContentBlock;
}

export default function VideoBlock({ block }: VideoBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { embedUrl, thumbnailUrl, title, duration } = block.content as VideoContent;
  
  const handlePlayClick = () => {
    setIsPlaying(true);
  };
  
  return (
    <div className="bg-dark rounded-lg border border-dark-border p-5">
      <div className="flex items-start mb-4">
        <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
          <Play className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-lg font-medium text-white">{block.title}</h3>
          {block.description && (
            <p className="mt-1 text-sm text-gray-400">{block.description}</p>
          )}
        </div>
      </div>
      
      <div className="ml-11 aspect-video bg-black rounded-md overflow-hidden">
        {isPlaying && embedUrl ? (
          <iframe
            src={embedUrl}
            title={title || "Video"}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center bg-gray-900 cursor-pointer"
            onClick={handlePlayClick}
            style={{
              backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="text-center p-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <p className="text-gray-400 text-sm">Clique para reproduzir o vídeo</p>
              {title && duration && (
                <p className="text-gray-500 text-xs mt-1">
                  {title} ({duration})
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
