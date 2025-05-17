'use client';
import React from 'react';
import { COMPANY_INFO } from '@/constants';

const CallBox: React.FC = () => {
  const phoneNumber = COMPANY_INFO.hotline.replace(/\s+/g, '');

  return (
    <div className="call-container right">
      <a id="call-btn" href={`tel:${phoneNumber}`} target="_blank" rel="noopener nofollow">
        <div className="animated_call infinite zoomIn_call cmoz-alo-circle"></div>
        <div className="animated_call infinite pulse_call cmoz-alo-circle-fill"></div>
        <span className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
        </span>
      </a>

      <style jsx>{`
        .call-container img {
          max-width: 100%;
          height: auto;
        }

        .call-container {
          position: fixed;
          width: 40px;
          height: 40px;
          bottom: 170px;
          z-index: 9999999;
        }

        .call-container.right {
          right: 35px;
        }

        .call-container a {
          display: block;
        }

        .call-container span {
          display: -webkit-flex;
          display: -moz-flex;
          display: -ms-flex;
          display: -o-flex;
          display: flex;
          -ms-align-items: center;
          align-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #FF0000;
          position: relative;
        }

        .zoomIn_call {
          animation-name: zoomIn_call;
        }

        .animated_call {
          animation-duration: 1s;
          animation-fill-mode: both;
        }

        .animated_call.infinite {
          animation-iteration-count: infinite;
        }

        .cmoz-alo-circle {
          width: 50px;
          height: 50px;
          top: -5px;
          right: -5px;
          position: absolute;
          background-color: transparent;
          -webkit-border-radius: 100%;
          -moz-border-radius: 100%;
          border-radius: 100%;
          border: 2px solid rgba(255, 0, 0, .8);
          border-color: #FF0000;
          opacity: .5;
        }

        .cmoz-alo-circle-fill {
          width: 60px;
          height: 60px;
          top: -10px;
          position: absolute;
          -webkit-transition: all 0.2s ease-in-out;
          -moz-transition: all 0.2s ease-in-out;
          -ms-transition: all 0.2s ease-in-out;
          -o-transition: all 0.2s ease-in-out;
          transition: all 0.2s ease-in-out;
          -webkit-border-radius: 100%;
          -moz-border-radius: 100%;
          border-radius: 100%;
          border: 2px solid transparent;
          -webkit-transition: all .5s;
          -moz-transition: all .5s;
          -o-transition: all .5s;
          transition: all .5s;
          background-color: rgba(255, 0, 0, .45);
          opacity: .75;
          right: -10px;
        }

        .pulse_call {
          -webkit-animation-name: pulse_call;
          animation-name: pulse_call;
        }

        .right {
          right: 0;
        }

        a:where(:not(.wp-element-button)) {
          text-decoration: none;
        }

        @keyframes zoomIn_call {
          from {
            opacity: 0;
            transform: scale3d(.3, .3, .3);
          }
          50% {
            opacity: 1;
          }
        }

        @-webkit-keyframes pulse_call {
          from {
            -webkit-transform: scale3d(1, 1, 1);
            transform: scale3d(1, 1, 1);
          }
          50% {
            -webkit-transform: scale3d(1.05, 1.05, 1.05);
            transform: scale3d(1.05, 1.05, 1.05);
          }
          to {
            -webkit-transform: scale3d(1, 1, 1);
            transform: scale3d(1, 1, 1);
          }
        }

        @keyframes pulse_call {
          from {
            -webkit-transform: scale3d(1, 1, 1);
            transform: scale3d(1, 1, 1);
          }
          50% {
            -webkit-transform: scale3d(1.05, 1.05, 1.05);
            transform: scale3d(1.05, 1.05, 1.05);
          }
          to {
            -webkit-transform: scale3d(1, 1, 1);
            transform: scale3d(1, 1, 1);
          }
        }
      `}</style>
    </div>
  );
};

export default CallBox; 