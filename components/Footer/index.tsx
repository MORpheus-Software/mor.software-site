import React from 'react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="mx-auto w-full max-w-screen-2xl p-4 text-white sm:px-10 sm:py-6">
      <div className="bottom-6 left-0 right-0 w-full">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-evenly gap-2 px-1 text-sm sm:px-4">
          <a
            href="https://github.com/MorpheusAIs/Docs"
            target="_blank"
            className="flex items-center gap-1"
          >
            <Image src="/github-logo.svg" alt="github-logo" width={48} height={48} />
            <p>Docs</p>
          </a>

          <a
            href="https://github.com/MorpheusAIs/Lite-Client"
            target="_blank"
            className="flex items-center gap-1"
          >
            <Image src="/github-logo.svg" alt="github-logo" width={48} height={48} />
            <p>Lite Client</p>
          </a>

          <a
            href="https://discord.com/invite/morpheusai"
            target="_blank"
            className="flex items-center gap-1"
          >
            <Image src="/discord-logo.svg" alt="discord-logo" width={36} height={36} />
            <p>Discord</p>
          </a>

          <a href="https://mor.org/" target="_blank" className="flex items-center gap-1">
            <Image src="/mor-logo.svg" alt="mor-logo" width={48} height={48} />
            <p>MOR.org</p>
          </a>

          <a href="https://x.com/MorpheusAIs" target="_blank" className="flex items-center gap-1">
            <Image src="/x-logo.png" alt="x-logo" width={36} height={36} className="h-8 w-auto" />
            <p>@MorpheusAIs</p>
          </a>

          <a
            href="https://www.reddit.com/r/MorpheusAI/"
            target="_blank"
            className="flex items-center gap-1"
          >
            <Image
              src="/reddit-logo.svg"
              alt="reddit-logo"
              width={24}
              height={24}
              className="h-12 w-auto"
            />
            <p>Reddit</p>
          </a>

          <a href="https://t.me/MorpheusAI" target="_blank" className="flex items-center gap-1">
            <Image src="/telegram-logo.svg" alt="telegram-logo" width={36} height={36} />
            <p>Telegram</p>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
