import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Navbar() {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Disclosure as="nav" className="bg-white border-b border-gray-200 shadow-sm">
      {({ open }) => (
        <>
          <div className=" px-12">
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo */}
              <div className="flex items-center  flex-start flex-1">
                <Link to="/" className="text-blue-600 font-bold text-lg tracking-wide">
                  MedBreif
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden sm:block sm:ml-6">
                <div className="flex space-x-4">
                  <Link to="/" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Home
                  </Link>
                  {role === 'doctor' && (
                    <>
                      <Link to="/doctor-dashboard" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                        Dashboard
                      </Link>
                      <Link to="/doctor-appointments" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                        Appointments
                      </Link>
                      <Link to="/doctor-profile" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                        Profile
                      </Link>
                    </>
                  )}

                  {role === 'patient' && (
                    <>
                      <Link to="/patient-dashboard" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                        Dashboard
                      </Link>
                      <Link to="/doctors" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                        Doctors
                      </Link>
                      <Link to="/patient-profile" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                        Profile
                      </Link>
                    </>
                  )}
                </div>
              </div>

{/* Profile Menu / Logout Button */}
<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
  {currentUser ? (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button
          title="Open user menu"
          className="flex items-center rounded-full bg-cyan-300 text-sm p-1 focus:outline-none focus:ring-2  focus:ring-offset-2 focus:ring-offset-white transition-transform transform hover:scale-105"
        >
          <img
            className="h-10 w-10 rounded-full border-2 border-white shadow-lg"
            src={currentUser.photoURL || "https://via.placeholder.com/49"}
            alt="User profile"
          />
          <span className="ml-3 text-white font-medium hidden sm:block">
            {currentUser.displayName || "User"}
          </span>
          <svg
            className="ml-2 h-4 w-4 text-white hidden sm:block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Menu.Button>
      </div>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/profile"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'flex items-center px-4 py-2 text-sm text-gray-800 hover:text-blue-600 transition-colors duration-200'
                )}
              >
                <svg
                  className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a3 3 0 100 6 3 3 0 000-6zM2 17a8 8 0 0116 0H2z"
                    clipRule="evenodd"
                  />
                </svg>
                Your Profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:text-red-600 transition-colors duration-200'
                )}
              >
                <svg
                  className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm7 3a1 1 0 00-1 1v1H5v2h4v1a1 1 0 102 0v-1h4V9h-4V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Logout
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  ) : (
                  <div className="flex space-x-4 items-center">
                    <Link
                      to="/auth?mode=login"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                Home
              </Link>
              {role === 'doctor' && (
                <>
                  <Link to="/doctor-dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Dashboard
                  </Link>
                  <Link to="/doctor-appointments" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Appointments
                  </Link>
                  <Link to="/doctor-profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Profile
                  </Link>
                </>
              )}

              {role === 'patient' && (
                <>
                  <Link to="/patient-dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Dashboard
                  </Link>
                  <Link to="/doctors" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Doctors
                  </Link>
                  <Link to="/patient-profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Profile
                  </Link>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default Navbar;
