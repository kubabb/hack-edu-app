import Image from "next/image";
import CTAAuthButtons from "./CTAAuthButtons";

export default function CTASection() {

  return (
    <section id="cennik" className="px-4 py-12">
      <div className="cartoon-panel mx-auto grid max-w-7xl overflow-hidden rounded-[32px] md:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center px-7 py-10 md:px-12">
          <h2 className="font-display text-4xl leading-none text-[#ff5144] md:text-6xl">
            Uczmy się razem!
          </h2>
          <p className="mt-4 text-lg font-extrabold leading-8 text-[#7a8bad]">
            Dołącz do społeczności uczniów i odkryj, jak przyjemna może być
            nauka z AI korepetytorem.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <CTAAuthButtons />
          </div>
        </div>

        <div className="relative min-h-[230px] bg-[#fff8df]">
          <Image
            src="/assets/tutorai-cta-illustration.png"
            alt="Cartoon ilustracja robota AI uczącego się z uczennicą"
            fill
            loading="eager"
            sizes="(min-width: 768px) 42vw, 92vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
