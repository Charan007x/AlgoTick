import LegalLayout from "../components/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" updated="August 14, 2026">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">1. Agreement</h2>
        <p>
          These Terms of Service (“Terms”) govern your use of AlgoTick, including the
          website, API, and optional browser extension (the “Service”). By creating an
          account or using AlgoTick, you agree to these Terms and our Privacy Policy. If
          you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">2. The service</h2>
        <p>
          AlgoTick helps you track LeetCode practice, schedule revisions, organize lists
          and notes, and optionally receive AI-generated study suggestions. AlgoTick is
          provided as-is for personal, non-commercial study use unless we agree otherwise
          in writing. We may change, suspend, or discontinue features at any time.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">3. Accounts</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>You must provide accurate account information and keep it up to date.</li>
          <li>You are responsible for your password, tokens, and activity on your account.</li>
          <li>
            You may sign in with email and password or with Google. Google sign-in is
            subject to Google’s own terms and privacy policy.
          </li>
          <li>
            We may suspend or terminate accounts that are abusive, automated in a harmful
            way, or used to violate these Terms.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">4. Acceptable use</h2>
        <p className="mb-3">You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Scrape, overload, or attempt to break the Service, other users’ accounts, or connected third-party sites.</li>
          <li>Upload malware, or content you do not have the right to use.</li>
          <li>Use AlgoTick to cheat on interviews, contests, or exams in a way that violates a third party’s rules.</li>
          <li>Misrepresent your identity or LeetCode activity.</li>
          <li>Resell, reverse engineer, or copy the Service except as allowed by law.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">5. Your content</h2>
        <p>
          You keep ownership of the problems you track, notes, lists, and files you
          upload (“User Content”). You grant us a limited license to host, process, and
          display that content only as needed to operate AlgoTick for you. You are
          responsible for User Content and for making sure it does not infringe anyone
          else’s rights.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">6. Third-party services</h2>
        <p>
          AlgoTick may connect to Google (sign-in and AI), LeetCode (public profile and
          submissions), Cloudinary (file storage), and other infrastructure providers.
          Those services are not controlled by us. LeetCode problem statements, trademarks,
          and website content belong to their owners. AlgoTick is an independent study
          tool and is not affiliated with, endorsed by, or sponsored by LeetCode or
          Google.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">7. AI Coach</h2>
        <p>
          AI suggestions are generated automatically and may be incomplete, outdated, or
          wrong. They are not a guarantee of interview outcomes. You remain responsible
          for how you study and what you submit on third-party platforms.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">8. Intellectual property</h2>
        <p>
          AlgoTick’s name, logo, design, and software are owned by us or our licensors.
          You may not use our marks in a way that suggests endorsement without permission.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">9. Disclaimer</h2>
        <p>
          THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT
          PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR
          STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT. We do not warrant that AlgoTick will be uninterrupted, error-free,
          or that tracked progress will match LeetCode at all times.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">10. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, ALGOTICK AND ITS OPERATORS WILL NOT BE
          LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
          FOR LOST PROFITS, DATA, OR STUDY PROGRESS, ARISING FROM YOUR USE OF THE SERVICE.
          OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE
          AMOUNT YOU PAID US FOR THE SERVICE IN THE 12 MONTHS BEFORE THE CLAIM, OR USD $50
          IF YOU HAVE NOT PAID US.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">11. Termination</h2>
        <p>
          You may stop using AlgoTick at any time. We may suspend or end access if you
          violate these Terms or if we shut down the Service. Provisions that should
          survive termination (including intellectual property, disclaimers, and liability
          limits) will survive.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">12. Changes to these Terms</h2>
        <p>
          We may update these Terms. The “Last updated” date will change when we do.
          Continued use after an update constitutes acceptance of the new Terms. If you
          do not agree, you must stop using the Service.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">13. Contact</h2>
        <p>
          Questions about these Terms can be sent through{" "}
          <a
            href="https://github.com/Charan007x"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#61dca3] hover:underline"
          >
            github.com/Charan007x
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
