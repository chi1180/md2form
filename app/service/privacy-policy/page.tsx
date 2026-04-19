import { LegalLinks } from "@/components/legal-links";
import { LEGAL_DATA } from "@/lib/CONFIG";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-6 py-6">
        <header className="space-y-3 border-b pb-4">
          <p className="text-xs text-muted-foreground">
            md2form Official Policy
          </p>
          <div className="flex justify-between">
            <h1 className="text-2xl font-semibold">Privacy Policy</h1>
            <Button variant="outline" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Established Date: {LEGAL_DATA["privacy-policy"].established_at}
            　/　Last Updated: {LEGAL_DATA["privacy-policy"].last_updated}
          </p>
          <LegalLinks show="privacy-policy" />
        </header>

        <article className="space-y-6 py-6 text-sm leading-7 text-muted-foreground">
          <p>
            The operator of md2form (hereinafter "the Service") establishes this
            Privacy Policy (hereinafter "this Policy") regarding the handling of
            personal information of users and form respondents on the Service as
            follows.
          </p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 1 (Personal Information)
            </h2>
            <p>
              "Personal Information" refers to "personal information" as defined
              in the Personal Information Protection Act, and means information
              about a living individual that can identify a specific individual
              through descriptions such as name, date of birth, email address,
              or other information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 2 (Methods of Collecting Personal Information)
            </h2>
            <p>
              The Service may obtain personal information in the following
              situations:
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                During Account Registration: Registration information such as
                email address.
              </li>
              <li>
                When Answering Forms: Information entered as responses to forms
                created by Users (name, email address, and other input fields).
              </li>
              <li>
                When Contacting Us: Information provided when contacting the
                Operator.
              </li>
              <li>
                Recording Usage: Technical information such as access logs, IP
                addresses, and browser information.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 3 (Purpose of Collecting and Using Personal Information)
            </h2>
            <p>
              The purposes for which the Operator collects and uses personal
              information are as follows:
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>To provide and operate the Service</li>
              <li>
                To respond to inquiries from Users (including identity
                verification)
              </li>
              <li>
                To send necessary communications such as maintenance
                announcements and important notices
              </li>
              <li>
                To identify and respond to Users who violate the Terms of
                Service or engage in unauthorized use
              </li>
              <li>To charge usage fees for paid plans</li>
              <li>To improve the Service and develop new features</li>
              <li>For purposes incidental to the above uses</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 4 (Data Storage Location)
            </h2>
            <p>
              Data collected in the Service (including form responses) is stored
              in a cloud database (PostgreSQL) provided by Supabase, Inc.
              (United States). For information about Supabase's privacy policy
              and security measures, please refer to
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="ml-1 text-primary underline underline-offset-2"
              >
                Supabase's official website
              </a>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 5 (Change of Purpose of Use)
            </h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                The Operator shall change the purpose of use of personal
                information only when the new purpose is reasonably recognized
                as having relevance to the previous purpose.
              </li>
              <li>
                When the purpose of use is changed, the new purpose shall be
                published on this website.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 6 (Disclosure of Personal Information to Third Parties)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Except as set forth below, the Operator shall not provide
                personal information to third parties without prior consent from
                Users, provided that this shall not apply to cases permitted by
                the Personal Information Protection Act or other applicable
                laws.
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>
                    When necessary to protect the life, body, or property of a
                    person and it is difficult to obtain the subject's consent
                  </li>
                  <li>
                    When particularly necessary for improvement of public health
                    or sound development of children, and it is difficult to
                    obtain the subject's consent
                  </li>
                  <li>
                    When necessary to cooperate with a government agency or
                    local government, or a person commissioned thereby, in
                    performing affairs defined by law, and obtaining the
                    subject's consent would interfere with the performance of
                    such affairs
                  </li>
                </ol>
              </li>
              <li>
                Notwithstanding the provisions of the preceding paragraph, the
                following shall not be deemed disclosure to a third party:
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>
                    When the Operator outsources the handling of personal
                    information within the scope necessary to achieve the
                    purposes of use
                  </li>
                  <li>
                    When personal information is provided in connection with
                    succession of business
                  </li>
                </ol>
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 7 (Disclosure of Personal Information)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Upon request for disclosure of personal information from the
                subject, the Operator shall disclose it to the subject without
                delay. However, the Operator may decline to disclose it in whole
                or in part if disclosure would fall under any of the following:
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>
                    If disclosure would risk harm to the rights or interests of
                    the subject or a third party, including their life, body,
                    property, or other interests
                  </li>
                  <li>
                    If disclosure would seriously interfere with the proper
                    implementation of the Operator's business
                  </li>
                  <li>If disclosure would violate other applicable laws</li>
                </ol>
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 8 (Correction and Deletion of Personal Information)
            </h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Users may request correction, addition, or deletion (hereinafter
                "Correction, etc.") of their personal information held by the
                Operator if such information is inaccurate, through the
                procedure established by the Operator.
              </li>
              <li>
                Upon receiving such a request, if the Operator determines that a
                response is necessary, it shall make the Correction, etc.
                without delay.
              </li>
              <li>
                The Operator shall notify the User without delay when it has
                made the Correction, etc. or decided not to do so.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 9 (Suspension of Use of Personal Information)
            </h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Upon request from the subject to suspend or delete (hereinafter
                "Suspension of Use, etc.") personal information on the grounds
                that it is being used beyond the scope of the stated purpose or
                was obtained by wrongful means, the Operator shall conduct
                necessary investigation without delay.
              </li>
              <li>
                Based on the results of the investigation, if the Operator
                determines that a response is necessary, it shall implement the
                Suspension of Use, etc. without delay.
              </li>
              <li>
                The Operator shall notify the User without delay when it has
                implemented the Suspension of Use, etc. or decided not to do so.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 10 (Cookies and Access Analysis)
            </h2>
            <p>
              The Service may use cookies and access analysis tools for the
              purpose of improving the Service and enhancing convenience. Users
              can refuse to accept cookies through their browser settings, but
              doing so may result in certain functions of the Service not
              operating properly.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 11 (Changes to Privacy Policy)
            </h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                This Policy may be changed without notice to Users except as
                otherwise provided by law or in this Policy.
              </li>
              <li>
                The modified Privacy Policy shall become effective upon posting
                on this website.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 12 (Contact Information)
            </h2>
            <p>
              Please contact the following for inquiries regarding this Policy:
            </p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr className="border-b">
                    <th className="w-40 bg-muted/40 px-3 py-2 text-left font-medium text-foreground">
                      Service Name
                    </th>
                    <td className="px-3 py-2">md2form</td>
                  </tr>
                  <tr className="border-b">
                    <th className="bg-muted/40 px-3 py-2 text-left font-medium text-foreground">
                      Operator
                    </th>
                    <td className="px-3 py-2">
                      chi1180 (Individual Operation)
                    </td>
                  </tr>
                  <tr className="border-b">
                    <th className="bg-muted/40 px-3 py-2 text-left font-medium text-foreground">
                      GitHub
                    </th>
                    <td className="px-3 py-2">
                      <a
                        href="https://github.com/chi1180/md2form"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline underline-offset-2"
                      >
                        https://github.com/chi1180/md2form
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-muted/40 px-3 py-2 text-left font-medium text-foreground">
                      Email
                    </th>
                    <td className="px-3 py-2">
                      <a
                        href={`mailto:${LEGAL_DATA["owner-info"].email}`}
                        className="text-primary underline underline-offset-2"
                      >
                        {LEGAL_DATA["owner-info"].email}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <p>End of Policy</p>
        </article>
      </div>
    </main>
  );
}
