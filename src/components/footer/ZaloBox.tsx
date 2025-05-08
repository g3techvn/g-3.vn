'use client';
import * as React from 'react';
import { COMPANY_INFO } from '@/constants';

export default function ZaloBox() {
  return (
    <div className="zalo-container right">
      <a id="zalo-btn" href={COMPANY_INFO.zalo} target="_blank" rel="noopener nofollow">
        <div className="animated_zalo infinite zoomIn_zalo cmoz-alo-circle"></div>
        <div className="animated_zalo infinite pulse_zalo cmoz-alo-circle-fill"></div>
        <span><img src="/images/zalo-2.png" alt="Contact Me on Zalo" /></span>
      </a>
    </div>
  );
}

// Styles
const styles = `
.zalo-container img {
  max-width: 100%;
  height: auto;
}
.zalo-container {
  position: fixed;
  width: 40px;
  height: 40px;
  bottom: 100px;
  z-index: 9999999;
}
.zalo-container.right {
  right: 35px;
}
.zalo-container a {
  display: block;
}
.zalo-container span {
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
  background: #1182FC;
  position: relative;
}
.zoomIn_zalo {
  animation-name: zoomIn_zalo;
}
.animated_zalo {
  animation-duration: 1s;
  animation-fill-mode: both;
}
.animated_zalo.infinite {
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
  border: 2px solid rgba(17, 130, 252, .8);
  border-color: #1182FC;
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
  background-color: rgba(17, 130, 252, .45);
  opacity: .75;
  right: -10px;
}
.pulse_zalo {
  -webkit-animation-name: pulse_zalo;
  animation-name: pulse_zalo;
}
.right {
  right: 0;
}
a:where(:not(.wp-element-button)) {
  text-decoration: none;
}

@keyframes zoomIn_zalo {
  from {
    opacity: 0;
    transform: scale3d(.3, .3, .3);
  }
  50% {
    opacity: 1;
  }
}
@-webkit-keyframes pulse_zalo {
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
@keyframes pulse_zalo {
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
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 