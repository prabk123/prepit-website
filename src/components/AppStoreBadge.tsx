import Image from "next/image";

export default function AppStoreBadge() {
  return (
    <a
      href="#"
      className="inline-block h-12 w-36 overflow-hidden rounded-lg bg-black"
    >
      <div className="relative flex h-full w-full items-center px-2.5">
        <svg
          width="24"
          height="29"
          viewBox="0 0 24 29"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <path
            d="M19.8193 14.9091C19.7952 12.0297 22.1458 10.6381 22.2581 10.5659C20.8906 8.50878 18.7611 8.22137 17.9929 8.19521C16.1423 8.00484 14.3519 9.30534 13.4093 9.30534C12.4486 9.30534 10.9819 8.21325 9.40484 8.24544C7.35982 8.27763 5.43758 9.4379 4.41274 11.2583C2.31952 14.9572 3.87646 20.3245 5.87592 23.2802C6.87565 24.7299 8.04155 26.3481 9.61655 26.2919C11.1553 26.2297 11.7229 25.3283 13.5855 25.3283C15.4301 25.3283 15.9615 26.2919 17.5687 26.2557C19.2201 26.2297 20.2299 24.7982 21.1945 23.3364C22.3523 21.6701 22.8094 20.0339 22.8275 19.9496C22.7935 19.9376 19.8474 18.8154 19.8193 14.9091Z"
            fill="white"
          />
          <path
            d="M16.7177 6.19521C17.5329 5.19749 18.0944 3.83776 17.9399 2.45996C16.7598 2.51013 15.3261 3.23745 14.4768 4.21709C13.7178 5.08045 13.0438 6.48619 13.2164 7.81577C14.5398 7.91811 15.8852 7.17473 16.7177 6.19521Z"
            fill="white"
          />
        </svg>
        <div className="ml-1.5 flex flex-col text-white">
          <span className="text-[10.8px] leading-tight">Download on the</span>
          <span className="text-[21.6px] leading-none tracking-tight">
            App Store
          </span>
        </div>
      </div>
    </a>
  );
}
