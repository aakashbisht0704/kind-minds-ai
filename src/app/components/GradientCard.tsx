import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface GradientCardProps {
  title: string;
  subtext: string;
  image: string;
  className?: string;
}

export const GradientCard = ({
  title,
  subtext,
  image,
  className = "",
}: GradientCardProps) => {
  return (
    <Card
      className={[
        "w-full h-[160px] p-4 rounded-2xl bg-gradient-to-b from-[#E7E0FF] via-[#F4E7FF] to-[#FFDDEB] shadow-sm hover:shadow-md grid grid-rows-[auto_1fr] text-left transition-all duration-200",
        className,
      ].join(" ")}
    >
      <CardHeader className="p-0 mb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-[16px] sm:text-[18px] md:text-[20px] leading-[1.1] font-semibold text-[#666666] flex-1">
            {title}
          </h3>
          <Image
            src={image}
            alt={title}
            width={40}
            height={40}
            className="flex-shrink-0 object-contain"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex items-start">
        <p className="text-[12px] sm:text-[13px] md:text-[14px] leading-[1.3] text-[#666666]">
          {subtext}
        </p>
      </CardContent>
    </Card>
  );
};
