import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-[80vh] bg-[#f6f4ef] pt-32 pb-20 px-4">
        <div className="mx-auto max-w-4xl cartoon-panel rounded-[32px] p-8 md:p-12 w-full text-[#315083]">
          <h1 className="font-display text-4xl text-[#06296b] mb-8">Polityka prywatności</h1>
          
          <div className="space-y-6 text-base font-bold leading-8 text-[#6e7fa6]">
            <p>
              Twoja prywatność jest dla nas ważna. Ta polityka opisuje, w jaki sposób zbieramy, 
              używamy i chronimy Twoje dane osobowe.
            </p>
            <h2 className="text-2xl font-extrabold text-[#06296b] mt-8 mb-4">1. Zbierane dane</h2>
            <p>
              Zbieramy informacje podane podczas rejestracji (np. adres email, imię) oraz dane 
              generowane podczas korzystania z aplikacji (historia czatów, wgrywane notatki).
            </p>
            
            <h2 className="text-2xl font-extrabold text-[#06296b] mt-8 mb-4">2. Wykorzystanie danych</h2>
            <p>
              Twoje materiały służą wyłącznie do generowania spersonalizowanych sesji nauki, quizów 
              oraz grafów wiedzy. Zewnętrzne modele AI nie używają Twoich prywatnych danych do 
              trenowania swoich ogólnodostępnych modeli.
            </p>

            <h2 className="text-2xl font-extrabold text-[#06296b] mt-8 mb-4">3. Bezpieczeństwo</h2>
            <p>
              Stosujemy nowoczesne mechanizmy ochrony danych. Masz prawo w każdej chwili usunąć 
              swoje konto oraz wszystkie wgrane materiały.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
