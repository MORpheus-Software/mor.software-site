'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';
import '@/app/styles/custom-mde.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

export default function MarkdownField({
  id,
  title,
  desc,
}: {
  id: string;
  title: string;
  desc: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEditorChange = (value: string) => {
    if (textareaRef.current) {
      textareaRef.current.value = value;
    }
  };

  return (
    <div className="mt-5 flex flex-col gap-4">
      <label className="mb-0 flex flex-col gap-2 text-xl text-white" htmlFor={id}>
        {title}
        <p className="text-sm text-gray-400">{desc}</p>
      </label>
      <SimpleMDE
        onChange={handleEditorChange}
        options={{
          placeholder: 'Content',
          spellChecker: false,
          hideIcons: ['fullscreen', 'side-by-side'],
        }}
      />
      <textarea ref={textareaRef} name={id} id={id} className="hidden"></textarea>
    </div>
  );
}
