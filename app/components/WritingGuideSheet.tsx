'use client';

import { useEffect } from 'react';

const sheetCloseStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid #eee',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1.5rem',
  lineHeight: 1,
  padding: '0.25rem 0.5rem',
  color: '#999',
};

function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#000', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.88rem', lineHeight: '1.55', color: '#444', margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

export default function WritingGuideSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
          zIndex: 999,
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(28rem, 90vw)',
          background: '#fff',
          borderLeft: '1px solid #e5e5e5',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms ease',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '2rem 1.5rem',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Writing Guide</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#999' }}>
              Gary Halbert &amp; The Boron Letters
            </p>
          </div>
          <button onClick={onClose} style={{ ...sheetCloseStyle }} aria-label="Close">
            &times;
          </button>
        </div>

        <GuideSection title="The #1 Rule">
          Write like you&rsquo;re talking to one person. Not an audience. One real human
          being sitting across from you. If your writing sounds like &ldquo;writing,&rdquo;
          rewrite it.
        </GuideSection>

        <GuideSection title="AIDA Framework">
          <strong>A</strong>ttention &mdash; Open with something that grabs them by the collar.
          A bold claim, a surprising fact, a question they can&rsquo;t ignore.<br />
          <strong>I</strong>nterest &mdash; Make them care. Tell a story. Connect to something
          they already feel.<br />
          <strong>D</strong>esire &mdash; Show them the payoff. Paint the picture of what
          they&rsquo;ll get, feel, or understand.<br />
          <strong>A</strong>ction &mdash; Tell them what to do next. Even in essays, give the
          reader a takeaway to act on.
        </GuideSection>

        <GuideSection title="Start With Movement">
          Halbert opened every day with a walk. Start your writing with momentum too.
          Your first sentence should <em>move</em>. No throat-clearing. No &ldquo;In this post
          I will discuss...&rdquo; Jump in.
        </GuideSection>

        <GuideSection title="Short Is Strong">
          Short sentences hit harder.<br />
          Short paragraphs get read.<br />
          One idea per paragraph. If a sentence doesn&rsquo;t earn its place, cut it.
          Halbert said: &ldquo;The purpose of the first sentence is to get you to read the
          second sentence.&rdquo;
        </GuideSection>

        <GuideSection title="Be Specific, Not Clever">
          &ldquo;He lost 14 pounds in 21 days&rdquo; beats &ldquo;He lost a lot of weight fast.&rdquo;
          Specifics create belief. Vague language creates doubt. Use real numbers, real
          names, real details.
        </GuideSection>

        <GuideSection title="Emotion First, Logic Second">
          People decide with emotion and justify with logic. Lead with how something
          <em>feels</em>. Then back it up with evidence. The Boron Letters: &ldquo;What matters
          is what the reader feels is true.&rdquo;
        </GuideSection>

        <GuideSection title="The Bucket Brigade">
          Use transitional hooks to keep the reader sliding down the page:<br />
          <em>&ldquo;Here&rsquo;s the thing...&rdquo;</em><br />
          <em>&ldquo;But it gets worse...&rdquo;</em><br />
          <em>&ldquo;Now, here&rsquo;s the kicker...&rdquo;</em><br />
          <em>&ldquo;Think about it:&rdquo;</em><br />
          These are greased slides. They kill the urge to stop reading.
        </GuideSection>

        <GuideSection title="Write Ugly First">
          Your first draft should be fast, messy, and alive. Don&rsquo;t edit while you
          write &mdash; that kills momentum. Halbert wrote copy by hand to stay
          connected to the words. Get it out, then clean it up.
        </GuideSection>

        <GuideSection title="The Starving Crowd Principle">
          The most important element isn&rsquo;t your writing &mdash; it&rsquo;s whether your
          reader is hungry for what you&rsquo;re saying. Write about things people
          already care about. Meet them where they are, then take them somewhere new.
        </GuideSection>

        <GuideSection title="Use &lsquo;You&rsquo; More Than &lsquo;I&rsquo;">
          Make the reader the hero. Every sentence should feel like it&rsquo;s
          about <em>them</em>, not you. Even when telling a personal story, connect it
          back: &ldquo;You&rsquo;ve probably felt this too.&rdquo;
        </GuideSection>

        <GuideSection title="The Halbert Structure">
          <ol style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
            <li>Open with a hook (story, question, bold claim)</li>
            <li>Establish the problem / tension</li>
            <li>Share your take &mdash; the insight, the angle</li>
            <li>Give proof (story, example, data)</li>
            <li>Deliver the payoff &mdash; what they walk away with</li>
            <li>End with a punch, not a whimper</li>
          </ol>
        </GuideSection>

        <GuideSection title="Close Strong">
          The last line lingers. End with a line worth remembering. A question that
          haunts. A statement that reframes everything. Never end with
          &ldquo;Thanks for reading.&rdquo;
        </GuideSection>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic', margin: 0 }}>
            &ldquo;If you want to be a good writer, you have to do one thing above all
            others: read a lot and write a lot.&rdquo; &mdash; Gary Halbert
          </p>
        </div>
      </div>
    </>
  );
}
