import { FaBookOpen, FaUsers, FaChalkboardTeacher } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';

const AboutUsPage = () => {
  return (
    <>
    <Helmet>
        <title>About | KUETx</title>
    </Helmet>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 text-blue-900">About KUETx</h1>
        <p className="text-lg text-gray-600 mb-10">
          Empowering learners and educators with the tools to succeed — anytime, anywhere.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
            <FaBookOpen className="text-blue-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Courses</h3>
            <p className="text-gray-600">
              Access a wide range of expertly crafted courses across various fields.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
            <FaUsers className="text-green-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-600">
              Connect, share, and grow with a vibrant learning community.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
            <FaChalkboardTeacher className="text-purple-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Mentorship</h3>
            <p className="text-gray-600">
              Learn directly from industry experts and experienced mentors.
            </p>
          </div>
        </div>

        {/* -------------------------- TEAM ----------------------------- */}
        <section id="team-section" className="bg-white py-20 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 mb-12">Final year students of ECE, KUET — united by code, driven by purpose.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Team Member 1 */}
              <div className="bg-gradient-to-tr from-indigo-50 via-white to-purple-50 shadow-xl rounded-3xl p-8 hover:shadow-2xl transition transform hover:-translate-y-1 duration-300">
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-indigo-700">Imamul Islam Ifti</h3>
                  <p className="text-sm text-gray-500 mb-2">Team Leader</p>
                  <p className="text-gray-700 mt-3 italic text-base">
                    "Architecting the backbone — from secure sign-ins to structured learning, one module at a time."
                  </p>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="bg-gradient-to-tr from-green-50 via-white to-yellow-50 shadow-xl rounded-3xl p-8 hover:shadow-2xl transition transform hover:-translate-y-1 duration-300">
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-green-700">Syed Nazib Sadi</h3>
                  <p className="text-sm text-gray-500 mb-2">Developer</p>
                  <p className="text-gray-700 mt-3 italic text-base">
                    "Building intelligent discussion platforms — combining scalable backend systems with AI moderation"
                  </p>
                </div>
              </div>

              {/* Team Member 3 */}
              <div className="bg-gradient-to-tr from-blue-50 via-white to-pink-50 shadow-xl rounded-3xl p-8 hover:shadow-2xl transition transform hover:-translate-y-1 duration-300">
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-blue-700">Saif Alvi</h3>
                  <p className="text-sm text-gray-500 mb-2">Developer</p>
                  <p className="text-gray-700 mt-3 italic text-base">
                    "Building intuitive flows for complex evaluations — where design meets data."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <p className="link text-xl text-blue-600 text-center">
          <a href="https://seagull-production.up.railway.app/" target="_blank">
          Learn More about our KUETx story...
          </a>
        </p>


      </div>
    </div>
    </>
  );
};

export default AboutUsPage;
