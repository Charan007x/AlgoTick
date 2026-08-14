import LegalLayout from "../components/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="August 14, 2026">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">1. Who we are</h2>
        <p>
          AlgoTick (“we”, “us”, or “our”) is a study tool that helps you track LeetCode
          problems, schedule revisions, take notes, and get optional AI coaching. This
          policy explains what information we collect, how we use it, and the choices you
          have. By using AlgoTick you agree to this policy.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">2. Information we collect</h2>
        <p className="mb-3">We collect information you provide and information created when you use the service:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-white/90">Account data:</span> username, email
            address, password (stored hashed), display name, and optional profile photo.
          </li>
          <li>
            <span className="font-medium text-white/90">Google account data:</span> if you
            sign in with Google, we receive your Google ID, name, email, and profile photo
            so we can create or link your AlgoTick account. We do not receive your Google
            password.
          </li>
          <li>
            <span className="font-medium text-white/90">Study data:</span> problems you add,
            revision history, custom lists, notes, and uploaded note files (such as PDFs).
          </li>
          <li>
            <span className="font-medium text-white/90">LeetCode data:</span> if you connect
            a LeetCode username, we may fetch publicly available profile and submission
            information to verify progress and power AI Coach insights.
          </li>
          <li>
            <span className="font-medium text-white/90">Usage data:</span> login tokens,
            notifications, and technical logs needed to operate, secure, and debug the
            service.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">3. How we use information</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Create and authenticate your account, including Google sign-in.</li>
          <li>Provide tracking, lists, notes, notifications, labs, and dashboard features.</li>
          <li>
            Generate optional AI Coach insights, study plans, and recommendations using
            your study and LeetCode activity.
          </li>
          <li>Sync sign-in state with the optional AlgoTick browser extension.</li>
          <li>Maintain security, prevent abuse, and improve reliability.</li>
          <li>Communicate service-related notices, such as account or security updates.</li>
        </ul>
        <p className="mt-3">
          We do not sell your personal information. We do not use your study content to
          advertise third-party products.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">4. Cookies and local storage</h2>
        <p>
          We use cookies and similar storage (including browser local storage) to keep you
          signed in, remember session state, and operate Google sign-in. The optional
          browser extension may store an authentication token locally on your device so it
          can add problems while you browse LeetCode. You can clear this data in your
          browser or by signing out.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">5. AI features</h2>
        <p>
          If you use AI Coach, relevant profile and submission information may be sent to
          our AI provider (currently Google Gemini) to generate insights and
          recommendations. Do not put secrets or sensitive personal data into notes or
          prompts that you do not want processed for this purpose. AI output can be
          inaccurate; treat it as a study aid, not professional advice.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">6. How we share information</h2>
        <p className="mb-3">
          We share information only with service providers that help us run AlgoTick, and
          only as needed to provide the service:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Hosting and database providers (for example, application hosting and MongoDB).</li>
          <li>Caching and rate-limiting infrastructure (Redis / Upstash).</li>
          <li>File storage for note attachments (Cloudinary, when uploads are enabled).</li>
          <li>Google, for OAuth sign-in and optional Gemini AI features.</li>
          <li>LeetCode, when you choose to connect a public LeetCode username.</li>
        </ul>
        <p className="mt-3">
          We may also disclose information if required by law, to protect our rights or
          users, or in connection with a merger, acquisition, or shutdown, in which case
          we will take reasonable steps to keep your information protected.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">7. Data retention</h2>
        <p>
          We keep account and study data while your account is active. Cached data may be
          stored for a limited time to improve performance. If you delete your account or
          ask us to delete your data, we will remove or anonymize personal information
          unless we must retain it for security, legal, or operational reasons (for
          example, backups that rotate on a delayed schedule).
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">8. Your choices</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Update profile details, LeetCode username, and privacy-related settings in the app.</li>
          <li>Disconnect Google sign-in by using an email/password account or deleting your account, where available.</li>
          <li>Delete notes, lists, and tracked problems from your account.</li>
          <li>Request access, correction, or deletion of your personal information by contacting us.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">9. Children</h2>
        <p>
          AlgoTick is not directed at children under 13, and we do not knowingly collect
          personal information from them. If you believe a child has created an account,
          contact us and we will delete it.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">10. Security and international processing</h2>
        <p>
          We use reasonable technical and organizational measures to protect your
          information, including hashed passwords and access-controlled APIs. No method of
          transmission or storage is completely secure. Our providers may process data in
          the United States or other countries. If you use AlgoTick from elsewhere, you
          understand that your information may be transferred to those locations.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">11. Changes</h2>
        <p>
          We may update this policy from time to time. The “Last updated” date at the top
          will change when we do. Continued use of AlgoTick after an update means you
          accept the revised policy.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">12. Contact</h2>
        <p>
          Questions about privacy can be sent through the AlgoTick GitHub project:{" "}
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
