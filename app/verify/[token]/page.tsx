export default async function VerifyCertificate({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="verification">
      <span className="eyebrow teal">ENGINEER ZERO / CERTIFICATE VERIFICATION</span>
      <h1>Coming soon — human credential review</h1>
      <p>
        Public certificate verification is backlogged for commercial launch.
        The personal pilot does not issue certificates. Local practice evidence
        stays in your browser and is not a verified credential.
      </p>
      <p>When certificates ship, this page will resolve a verification token without exposing private learner records.</p>
      <code>{token}</code>
    </main>
  );
}
