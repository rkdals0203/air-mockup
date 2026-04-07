import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Wifi, WifiOff, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface MagicLinkProps {
  sessionCode: string | null;
  isConnected: boolean;
}

const MagicLink = ({ sessionCode, isConnected }: MagicLinkProps) => {
  const [copied, setCopied] = useState(false);

  const getNetworkOrigin = () => {
    const { protocol, hostname, port } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const networkHost = import.meta.env.VITE_NETWORK_HOST;
      if (networkHost) return `${protocol}//${networkHost}:${port}`;
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  };

  const mobileUrl = sessionCode
    ? `${getNetworkOrigin()}/mobile?code=${sessionCode}`
    : "";

  const handleCopy = () => {
    if (!mobileUrl) return;
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Step 2 — Magic Link
      </h3>
      <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-4">
        {sessionCode ? (
          <>
            <div className="flex justify-center">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={mobileUrl} size={100} level="M" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">세션 코드</p>
              <p className="font-mono text-lg font-bold text-foreground tracking-widest">
                {sessionCode}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 rounded-lg hover:bg-secondary/50"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  복사됨!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  링크 복사
                </>
              )}
            </button>
          </>
        ) : (
          <div className="flex justify-center py-4">
            <div className="animate-pulse text-sm text-muted-foreground">
              세션 생성 중...
            </div>
          </div>
        )}

        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          {isConnected ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1.5">
              <Wifi className="w-3 h-3" />
              모바일 연결됨
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground gap-1.5">
              <WifiOff className="w-3 h-3" />
              대기 중
            </Badge>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MagicLink;
