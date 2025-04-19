import React from 'react';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();

  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("access_key", "1a1fa673-6773-49c4-aae3-a437315e661c");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: json
    }).then((res) => res.json());

    if (res.success) {
      Swal.fire({
        title: t('success_title'),
        text: t('success_message'),
        icon: "success"
      });
      event.target.reset(); // Clear the form after successful submission
    }
  };

  return (
    <section id="contact" className="bg-custom-white dark:bg-custom-dark text-black dark:text-white py-20 px-4 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">{t('contact_us')}</h2>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block mb-2">{t('your_name')}</label>
            <input
              type="text"
              name="name"
              placeholder={t('enter_name')}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block mb-2">{t('your_email')}</label>
            <input
              type="email"
              name="email"
              placeholder={t('enter_email')}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block mb-2">{t('message')}</label>
            <textarea
              name="message"
              rows="6"
              placeholder={t('write_message')}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
          >
            {t('send_message')}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
