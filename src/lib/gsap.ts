"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

let registered = false;
if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("cine", "0.76,0,0.24,1");
  CustomEase.create("expo", "0.16,1,0.3,1");
  gsap.defaults({ ease: "expo", duration: 1 });
  registered = true;
}

export { gsap, ScrollTrigger, SplitText };
