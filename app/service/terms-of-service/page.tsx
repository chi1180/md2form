import { LegalLinks } from "@/components/legal-links";
import { LEGAL_DATA } from "@/lib/CONFIG";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-6 py-6">
        <header className="space-y-3 border-b pb-4">
          <p className="text-xs text-muted-foreground">
            md2form Official Policy
          </p>
          <div className="flex justify-between">
            <h1 className="text-2xl font-semibold">Terms of Service</h1>
            <Button variant="outline" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Established Date: {LEGAL_DATA["terms-of-service"].established_at}
            　／　Last Updated: {LEGAL_DATA["terms-of-service"].last_updated}
          </p>
          <LegalLinks show="terms-of-service" />
        </header>

        <article className="space-y-6 py-6 text-sm leading-7 text-muted-foreground">
          <p>
            These Terms of Service (hereinafter referred to as "these Terms")
            define the conditions for the use of md2form (hereinafter referred
            to as "the Service"). Users who use the Service (hereinafter
            referred to as "Users") are required to use the Service in
            accordance with these Terms.
          </p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 1 (Application)
            </h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                These Terms apply to all relationships between Users and the
                operator of the Service (hereinafter referred to as "the
                Operator") relating to the use of the Service.
              </li>
              <li>
                The Operator may establish various rules and provisions
                (hereinafter referred to as "individual provisions") in addition
                to these Terms. These individual provisions shall constitute a
                part of these Terms regardless of their name.
              </li>
              <li>
                In the event of conflict between these Terms and individual
                provisions, the individual provisions shall take precedence
                unless otherwise specified in the individual provisions.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 2 (User Registration)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Registration with the Service shall be completed when an
                applicant agrees to these Terms, submits a registration
                application in the manner prescribed by the Operator, and the
                Operator approves such application.
              </li>
              <li>
                The Operator may not approve an application for registration if
                it determines that the applicant falls under any of the
                following circumstances, and shall have no obligation to
                disclose the reasons:
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>If false information was provided in the application</li>
                  <li>If the applicant has previously violated these Terms</li>
                  <li>
                    If the Operator otherwise deems registration inappropriate
                  </li>
                </ol>
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 3 (Management of User ID and Password)
            </h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Users shall be responsible for properly managing their User ID
                and password for the Service.
              </li>
              <li>
                Users may not transfer, lend, or share their User ID and
                password with any third party under any circumstances.
              </li>
              <li>
                Except in cases where the Operator has acted with intent or
                gross negligence, the Operator shall not be liable for any
                damages arising from the use of the User ID and password by
                third parties.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 4 (Pricing Plans and Payment)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                The Service offers the following pricing plans:
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Free Plan: Up to 3 forms can be created.</li>
                  <li>
                    Pro Plan (¥300 / month): Up to 1,000 forms can be created.
                    Additional features are available.
                  </li>
                </ol>
              </li>
              <li>
                Fees for paid plans shall be paid through payment services
                designated by the Operator.
              </li>
              <li>
                Fees paid shall not be refunded unless otherwise provided by law
                or these Terms.
              </li>
              <li>
                If a User fails to pay a usage fee, the User shall pay a late
                charge at the rate of 14.6% per annum.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 5 (Prohibited Acts)
            </h2>
            <p>
              Users shall not engage in the following acts when using the
              Service:
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Acts that violate laws or public order and morals</li>
              <li>Acts related to criminal activity</li>
              <li>
                Acts that infringe on the copyrights, trademarks, or other
                intellectual property rights of the Operator
              </li>
              <li>
                Acts that damage or interfere with the functioning of servers or
                networks of the Operator, other Users, or third parties
              </li>
              <li>
                Acts of commercial use of information obtained through the
                Service without permission from the Operator
              </li>
              <li>Acts that may interfere with the operation of the Service</li>
              <li>
                Acts of unauthorized access or attempted unauthorized access
              </li>
              <li>
                Acts of illegally collecting or accumulating personal
                information about other Users
              </li>
              <li>Acts of impersonating other Users</li>
              <li>
                Acts of directly or indirectly providing benefits to antisocial
                forces
              </li>
              <li>
                Acts of using forms for spam, phishing, fraud, or similar
                purposes
              </li>
              <li>Other acts deemed inappropriate by the Operator</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 6 (Suspension of Service Provision)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                The Operator may suspend or interrupt all or part of the Service
                without prior notice to Users if it determines that any of the
                following circumstances exist:
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>
                    When maintenance, inspection, or updates of the Service
                    system are performed
                  </li>
                  <li>
                    When provision becomes difficult due to force majeure events
                    such as earthquakes, lightning, fire, power outages, or
                    natural disasters
                  </li>
                  <li>
                    When a computer or communication line stops due to accident
                  </li>
                  <li>
                    When the Operator determines provision to be difficult for
                    other reasons
                  </li>
                </ol>
              </li>
              <li>
                The Operator shall not be liable for any disadvantages or
                damages suffered by Users or third parties as a result of
                suspension or interruption of the Service.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 7 (Use Restrictions and Cancellation of Registration)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                The Operator may, without prior notice, restrict the use of the
                Service or cancel the User registration if a User falls under
                any of the following circumstances:
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>If the User violates any provision of these Terms</li>
                  <li>
                    If false information is discovered in the registration
                    details
                  </li>
                  <li>
                    If there is a default in the payment of fees or other
                    obligations
                  </li>
                  <li>
                    If the User does not respond to communications from the
                    Operator for a certain period
                  </li>
                  <li>
                    If the Operator otherwise deems continued use inappropriate
                  </li>
                </ol>
              </li>
              <li>
                The Operator shall not be liable for any damages suffered by
                Users as a result of actions taken pursuant to this Article.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 8 (Withdrawal)
            </h2>
            <p>
              Users may withdraw from the Service through the withdrawal
              procedure prescribed by the Operator. After withdrawal, the
              account and form data may be deleted.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 9 (Disclaimer of Warranties and Limitation of Liability)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                The Operator does not guarantee, either expressly or implicitly,
                that the Service is free from defects in fact or in law
                (including defects in safety, reliability, accuracy,
                completeness, effectiveness, fitness for a particular purpose,
                and security, as well as errors, bugs, and infringement of
                rights).
              </li>
              <li>
                Except in cases of intent or gross negligence on the part of the
                Operator, the Operator shall not be liable for any damages
                arising from the Service that occur to Users.
              </li>
              <li>
                If the contract between the Operator and a User constitutes a
                consumer contract as defined in the Consumer Contract Act, the
                disclaimer provision in the preceding paragraph shall not apply.
                However, even in this case, the Operator shall not be liable for
                damages arising from special circumstances caused by the
                Operator's negligence (excluding gross negligence), and the
                amount of damages shall be limited to the usage fees received in
                the month in which the damage occurred.
              </li>
              <li>
                The Operator shall not be liable for any transactions,
                communications, disputes, or other matters arising between Users
                or between Users and third parties in connection with the
                Service.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 10 (Changes to Service Content)
            </h2>
            <p>
              The Operator may change, add to, or discontinue the content of the
              Service with prior notice to Users, and Users agree to accept such
              changes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 11 (Modification of Terms of Service)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                The Operator may modify these Terms without obtaining the
                individual consent of Users in the following cases:
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>
                    When the modification is in the general interest of Users.
                  </li>
                  <li>
                    When the modification does not conflict with the purpose of
                    the Service agreement, and is reasonable in light of the
                    necessity of the modification, the appropriateness of the
                    modified terms, and other circumstances.
                  </li>
                </ol>
              </li>
              <li>
                The Operator shall notify Users in advance of modifications to
                these Terms pursuant to the preceding paragraph, including the
                fact of modification, the modified content, and the effective
                date.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 12 (Handling of Personal Information)
            </h2>
            <p>
              The Operator shall handle personal information obtained through
              the use of the Service in accordance with the "Privacy Policy"
              established separately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 13 (Notices and Communications)
            </h2>
            <p>
              Communications between Users and the Operator shall be made in
              accordance with the method prescribed by the Operator. The
              Operator shall treat the currently registered contact information
              as valid unless the User submits a notification of change, and
              shall consider communications sent to such address to have been
              delivered to the User at the time of transmission.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 14 (Prohibition on Transfer of Rights and Obligations)
            </h2>
            <p>
              Users may not transfer their position in the service agreement or
              their rights or obligations under these Terms to any third party,
              or pledge them as collateral, without prior written consent from
              the Operator.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Article 15 (Governing Law and Jurisdiction)
            </h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                These Terms shall be interpreted in accordance with the laws of
                Japan.
              </li>
              <li>
                In the event of any dispute relating to the Service, the Tokyo
                District Court shall be the exclusive court of first instance.
              </li>
            </ol>
          </section>

          <p>End of Terms</p>
        </article>
      </div>
    </main>
  );
}
