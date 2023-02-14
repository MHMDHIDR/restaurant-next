import { LogoProps } from '@types'

const Logo = ({ width = '10', height = '10', className = '', color = '' }: LogoProps) => (
  <svg
    width='50'
    height='50'
    viewBox='0 0 74 92'
    xmlns='http://www.w3.org/2000/svg'
    className={`w-${width} h-${height} ${className}`}
    xlinkTitle='Restaurant Logo'
  >
    <g clipPath='url(#clip0)'>
      <path
        d='M46.2204 30.8525L48.6881 30.6959C48.6922 30.6955 48.6967 30.6952 48.7012 30.6949C50.4597 30.5462 52.0382 29.6232 53.0322 28.1617L54.983 25.294C56.681 22.7974 57.3388 19.782 56.8348 16.8035C56.7358 16.2185 56.4371 15.6795 55.9943 15.2862C55.5511 14.8926 54.9814 14.6601 54.3899 14.6319C51.3771 14.4874 48.4692 15.5035 46.1992 17.4919L43.5915 19.7762C42.2627 20.9401 41.5372 22.6208 41.6007 24.3883C41.601 24.3924 41.601 24.3969 41.6013 24.4014L41.742 26.8746C41.7968 27.8387 41.444 28.79 40.7759 29.4829L20.4032 50.4527C19.8578 51.0226 19.5762 51.8044 19.6105 52.6542C19.6483 53.5898 20.0767 54.5087 20.7567 55.1126C21.3709 55.6581 22.2153 55.9689 23.0593 55.9689C23.1497 55.9689 23.24 55.9653 23.3301 55.958C24.1763 55.8902 24.9175 55.5165 25.4193 54.902L43.7505 32.1278C44.3583 31.3784 45.2588 30.9135 46.2204 30.8525ZM42.7719 31.3341L24.4423 54.1064C24.1622 54.4493 23.7316 54.6605 23.2298 54.7007C22.6328 54.7485 22.0208 54.5495 21.592 54.1687C21.1633 53.7876 20.8928 53.2026 20.8688 52.6032C20.8483 52.0994 21.0056 51.6458 21.3088 51.3292L41.6798 30.361C42.5931 29.4142 43.0737 28.1174 42.9994 26.803L42.8587 24.3363C42.8109 22.9528 43.3797 21.6374 44.4202 20.7259L47.0279 18.4416C49.0517 16.669 51.6454 15.7639 54.33 15.8917C54.6357 15.9065 54.9298 16.0265 55.1589 16.2301C55.388 16.4333 55.5422 16.712 55.5934 17.0141C56.0427 19.6696 55.4563 22.3576 53.9426 24.5832L51.9917 27.4512C51.2134 28.5955 49.9781 29.3188 48.6015 29.4373L46.1406 29.5933C44.8294 29.6768 43.6021 30.3106 42.7719 31.3341Z'
        className={`transition-colors ${
          color ? `fill-${color}` : `fill-gray-800 dark:fill-white`
        }`}
      />
      <path
        d='M55.837 50.2935L42.1771 37.8276C41.9201 37.5929 41.5221 37.6115 41.2876 37.869C41.0537 38.1265 41.0723 38.5256 41.3292 38.7603L54.9856 51.2232C55.3105 51.5241 55.4947 51.9675 55.5047 52.4715C55.5165 53.0713 55.2816 53.6713 54.8763 54.0775C54.4713 54.4833 53.8733 54.7193 53.2735 54.7071C52.7704 54.6971 52.3279 54.5125 52.0308 54.1905L39.8588 40.8009C39.6245 40.5431 39.2262 40.5248 38.9692 40.7592C38.7122 40.9939 38.6937 41.393 38.9279 41.6505L51.1028 55.0432C51.638 55.6231 52.4 55.9518 53.2488 55.9685C53.2709 55.9689 53.2927 55.9692 53.3148 55.9692C54.2271 55.9692 55.1394 55.5984 55.7665 54.9697C56.4093 54.3257 56.7819 53.3827 56.7633 52.4468C56.7467 51.5963 56.4189 50.8328 55.837 50.2935Z'
        className={`transition-colors ${
          color ? `fill-${color}` : `fill-gray-800 dark:fill-white`
        }`}
      />
      <path
        d='M22.5973 30.7331C23.6394 31.695 24.9932 32.2434 26.4095 32.2774C26.414 32.2777 26.4185 32.2777 26.4227 32.2777L28.8952 32.2854C29.859 32.2883 30.7854 32.6983 31.4356 33.4082L32.5247 34.6061C32.6491 34.7428 32.8192 34.8122 32.9903 34.8122C33.1416 34.8122 33.2935 34.7579 33.4139 34.6478C33.6712 34.4131 33.6898 34.014 33.4556 33.7565L32.3648 32.5571C31.4766 31.5868 30.2134 31.0282 28.8993 31.0237L26.4336 31.016C25.338 30.988 24.2905 30.5678 23.4788 29.8316L16.3136 21.2971C16.2405 21.2098 16.246 21.0833 16.3264 21.0027C16.3815 20.9471 16.4462 20.9391 16.4799 20.9391C16.5135 20.9391 16.5783 20.9471 16.6337 21.0027L23.1558 27.5379C23.8006 28.1839 24.8497 28.1839 25.4944 27.5376L26.2609 26.7699V26.7696L27.6217 25.406C27.6217 25.406 27.6221 25.406 27.6221 25.4057L27.6224 25.4054L28.3885 24.6377C29.0333 23.9918 29.0333 22.9406 28.3885 22.2946L21.8664 15.7597C21.7818 15.675 21.7818 15.5366 21.8664 15.4518C21.9468 15.3713 22.0731 15.3658 22.1602 15.439L30.6781 22.6186C31.4131 23.4315 31.8326 24.4814 31.8605 25.5788L31.8678 28.0497C31.8723 29.366 32.4302 30.6316 33.3998 31.5236L34.5669 32.5885C34.8242 32.8232 35.2222 32.8046 35.4564 32.5471C35.6903 32.2893 35.6717 31.8905 35.4147 31.6558L34.2496 30.5925C33.5392 29.9394 33.1304 29.0109 33.1271 28.0455L33.1195 25.5682C33.1195 25.5637 33.1195 25.5592 33.1191 25.5547C33.0852 24.1356 32.5379 22.7791 31.5778 21.735C31.5599 21.7154 31.5407 21.6968 31.5202 21.6795L22.9706 14.4736C22.3797 13.9753 21.5223 14.0125 20.9762 14.5596C20.4004 15.1366 20.4004 16.075 20.9762 16.6517L27.4984 23.1869C27.6522 23.341 27.6522 23.5917 27.4984 23.7458L27.177 24.0675L19.9079 16.7846C19.6621 16.538 19.2635 16.538 19.0177 16.7846C18.772 17.0308 18.772 17.4302 19.0177 17.6765L26.2868 24.9598L25.8158 25.4314L18.5467 18.1484C18.3009 17.9022 17.9023 17.9022 17.6565 18.1484C17.4104 18.3947 17.4104 18.7941 17.6565 19.0404L24.9253 26.3236L24.6042 26.6457C24.4504 26.7998 24.2001 26.7998 24.0463 26.6457L17.5239 20.1108C17.2451 19.8314 16.8743 19.6773 16.4799 19.6773C16.0854 19.6773 15.7147 19.8314 15.4359 20.1108C14.8899 20.6579 14.853 21.517 15.35 22.1094L22.5422 30.6753C22.5592 30.6959 22.5778 30.7151 22.5973 30.7331Z'
        className={`transition-colors ${
          color ? `fill-${color}` : `fill-gray-800 dark:fill-white`
        }`}
      />
    </g>
    <path
      d='M9.09 89.178C8.802 89.178 8.472 89.022 8.1 88.71C7.728 88.398 7.338 87.99 6.93 87.486C6.534 86.982 6.138 86.43 5.742 85.83C5.358 85.218 4.992 84.606 4.644 83.994C4.296 83.382 4.002 82.83 3.762 82.338C3.438 83.442 3.126 84.534 2.826 85.614C2.538 86.682 2.262 87.672 1.998 88.584C1.65 88.584 1.32 88.488 1.008 88.296C0.708 88.104 0.558 87.852 0.558 87.54C0.558 87.408 0.588 87.252 0.648 87.072C0.708 86.892 0.762 86.718 0.81 86.55C1.158 85.506 1.47 84.576 1.746 83.76C2.022 82.932 2.28 82.176 2.52 81.492C2.772 80.796 3.024 80.112 3.276 79.44C3.54 78.756 3.828 78.042 4.14 77.298C4.452 76.554 4.812 75.714 5.22 74.778C4.752 74.874 4.338 75 3.978 75.156C3.63 75.312 3.342 75.45 3.114 75.57C2.898 75.69 2.748 75.75 2.664 75.75C2.604 75.75 2.514 75.714 2.394 75.642C2.274 75.558 2.166 75.462 2.07 75.354C1.986 75.234 1.944 75.132 1.944 75.048C2.28 74.916 2.67 74.772 3.114 74.616C3.57 74.46 4.068 74.328 4.608 74.22C5.148 74.1 5.706 74.04 6.282 74.04C6.822 74.04 7.38 74.106 7.956 74.238C8.532 74.358 9.066 74.556 9.558 74.832C10.05 75.108 10.446 75.468 10.746 75.912C11.046 76.356 11.196 76.89 11.196 77.514C11.196 78.198 11.016 78.774 10.656 79.242C10.308 79.698 9.852 80.07 9.288 80.358C8.736 80.646 8.142 80.868 7.506 81.024C6.882 81.18 6.288 81.288 5.724 81.348C5.172 81.396 4.722 81.426 4.374 81.438C4.89 82.242 5.394 83.028 5.886 83.796C6.39 84.564 6.978 85.326 7.65 86.082C8.322 86.838 9.168 87.606 10.188 88.386C10.14 88.626 9.99 88.818 9.738 88.962C9.498 89.106 9.282 89.178 9.09 89.178ZM4.176 80.898C4.848 80.85 5.508 80.742 6.156 80.574C6.816 80.406 7.41 80.172 7.938 79.872C8.478 79.572 8.904 79.2 9.216 78.756C9.54 78.3 9.702 77.766 9.702 77.154C9.702 76.53 9.546 76.044 9.234 75.696C8.922 75.336 8.52 75.078 8.028 74.922C7.536 74.766 7.02 74.682 6.48 74.67C6.072 75.474 5.676 76.422 5.292 77.514C4.908 78.594 4.536 79.722 4.176 80.898ZM12.7579 87.792C11.9899 87.792 11.3959 87.582 10.9759 87.162C10.5679 86.754 10.3639 86.238 10.3639 85.614C10.3639 85.086 10.4959 84.528 10.7599 83.94C11.0359 83.34 11.4019 82.782 11.8579 82.266C12.3139 81.738 12.8179 81.312 13.3699 80.988C13.9219 80.664 14.4739 80.502 15.0259 80.502C15.3379 80.502 15.6319 80.586 15.9079 80.754C16.1959 80.91 16.3399 81.228 16.3399 81.708C16.3399 82.164 16.2079 82.59 15.9439 82.986C15.6799 83.382 15.3259 83.736 14.8819 84.048C14.4379 84.36 13.9459 84.618 13.4059 84.822C12.8779 85.014 12.3439 85.14 11.8039 85.2C11.7919 85.248 11.7799 85.302 11.7679 85.362C11.7679 85.41 11.7679 85.494 11.7679 85.614C11.7679 85.674 11.7739 85.782 11.7859 85.938C11.8099 86.082 11.8639 86.238 11.9479 86.406C12.0319 86.574 12.1699 86.718 12.3619 86.838C12.5539 86.958 12.8179 87.018 13.1539 87.018C13.6579 87.018 14.1619 86.88 14.6659 86.604C15.1819 86.316 15.6619 85.938 16.1059 85.47C16.5619 85.002 16.9399 84.48 17.2399 83.904L17.5999 84.192C17.2759 84.912 16.8559 85.542 16.3399 86.082C15.8359 86.622 15.2719 87.042 14.6479 87.342C14.0359 87.642 13.4059 87.792 12.7579 87.792ZM12.0019 84.534C12.3139 84.498 12.6619 84.39 13.0459 84.21C13.4299 84.03 13.7959 83.802 14.1439 83.526C14.5039 83.25 14.7979 82.95 15.0259 82.626C15.2539 82.29 15.3679 81.954 15.3679 81.618C15.3679 81.486 15.3439 81.396 15.2959 81.348C15.2479 81.3 15.1699 81.276 15.0619 81.276C14.7859 81.276 14.4979 81.378 14.1979 81.582C13.8979 81.774 13.6039 82.032 13.3159 82.356C13.0279 82.668 12.7699 83.016 12.5419 83.4C12.3139 83.784 12.1339 84.162 12.0019 84.534ZM18.9107 87.918C18.3107 87.918 17.8247 87.792 17.4527 87.54C17.0927 87.3 16.8347 86.994 16.6787 86.622C16.5227 86.238 16.4447 85.848 16.4447 85.452C16.4447 85.104 16.4927 84.834 16.5887 84.642C16.6847 84.45 16.8047 84.312 16.9487 84.228C17.0927 84.132 17.2247 84.06 17.3447 84.012C17.4767 83.964 17.5727 83.91 17.6327 83.85C17.9327 83.538 18.2387 83.178 18.5507 82.77C18.8747 82.35 19.1507 81.888 19.3787 81.384V81.204C19.3787 80.724 19.4567 80.388 19.6127 80.196C19.7807 79.992 19.9727 79.89 20.1887 79.89C20.3327 79.89 20.4347 79.926 20.4947 79.998C20.5667 80.07 20.6087 80.154 20.6207 80.25C20.6207 80.322 20.6027 80.406 20.5667 80.502C20.5427 80.598 20.5307 80.73 20.5307 80.898C20.5307 81.258 20.6147 81.672 20.7827 82.14C20.9627 82.596 21.1367 83.082 21.3047 83.598C21.4847 84.114 21.5747 84.642 21.5747 85.182C21.5747 85.326 21.5687 85.458 21.5567 85.578C21.5447 85.698 21.5267 85.812 21.5027 85.92C21.8747 85.824 22.2407 85.62 22.6007 85.308C22.9607 84.984 23.3027 84.51 23.6267 83.886L23.8427 84.048C23.6147 84.732 23.2847 85.284 22.8527 85.704C22.4207 86.112 21.9167 86.364 21.3407 86.46C21.1487 86.952 20.8307 87.318 20.3867 87.558C19.9547 87.798 19.4627 87.918 18.9107 87.918ZM20.0807 85.884C20.1047 85.8 20.1167 85.704 20.1167 85.596C20.1287 85.476 20.1347 85.386 20.1347 85.326C20.1227 84.786 20.0507 84.252 19.9187 83.724C19.7867 83.196 19.6547 82.656 19.5227 82.104C19.3067 82.476 19.0547 82.878 18.7667 83.31C18.4787 83.742 18.2087 84.09 17.9567 84.354C18.1487 84.678 18.4307 84.984 18.8027 85.272C19.1747 85.56 19.6007 85.764 20.0807 85.884ZM18.7847 87.126C19.0247 87.126 19.2467 87.066 19.4507 86.946C19.6547 86.826 19.8167 86.652 19.9367 86.424C19.4447 86.316 19.0007 86.124 18.6047 85.848C18.2087 85.572 17.9027 85.29 17.6867 85.002C17.5187 85.038 17.4347 85.2 17.4347 85.488C17.4347 85.884 17.5487 86.256 17.7767 86.604C18.0047 86.952 18.3407 87.126 18.7847 87.126ZM24.7532 87.828C24.2252 87.828 23.7992 87.672 23.4752 87.36C23.1512 87.048 22.9892 86.574 22.9892 85.938C22.9892 85.446 23.0792 84.834 23.2592 84.102C23.4512 83.37 23.6912 82.614 23.9792 81.834C23.8952 81.81 23.7932 81.792 23.6732 81.78C23.5652 81.756 23.4572 81.72 23.3492 81.672V81.114C23.5412 81.138 23.6972 81.156 23.8172 81.168C23.9492 81.18 24.0812 81.192 24.2132 81.204C24.4652 80.568 24.7352 79.956 25.0232 79.368C25.3232 78.768 25.6172 78.234 25.9052 77.766C26.2052 77.298 26.4872 76.932 26.7512 76.668C27.0152 76.392 27.2492 76.254 27.4532 76.254C27.5732 76.254 27.6872 76.302 27.7952 76.398C27.9032 76.482 27.9572 76.608 27.9572 76.776C27.9572 77.016 27.8312 77.358 27.5792 77.802C27.3392 78.246 27.0392 78.768 26.6792 79.368C26.3192 79.956 25.9712 80.586 25.6352 81.258H26.1932C26.7212 81.258 27.1952 81.252 27.6152 81.24C28.0472 81.216 28.4852 81.18 28.9292 81.132V81.726C28.2692 81.786 27.6632 81.834 27.1112 81.87C26.5592 81.906 26.0312 81.93 25.5272 81.942H25.3112C25.0592 82.53 24.8372 83.136 24.6452 83.76C24.4652 84.372 24.3752 84.972 24.3752 85.56C24.3752 86.052 24.4532 86.4 24.6092 86.604C24.7652 86.808 25.0112 86.91 25.3472 86.91C25.9472 86.91 26.5592 86.64 27.1832 86.1C27.8192 85.548 28.3712 84.804 28.8392 83.868L29.0912 84.048C28.7792 84.756 28.3892 85.398 27.9212 85.974C27.4652 86.55 26.9672 87 26.4272 87.324C25.8872 87.66 25.3292 87.828 24.7532 87.828ZM29.3088 87.846C28.9128 87.846 28.5708 87.714 28.2828 87.45C27.9828 87.186 27.8328 86.79 27.8328 86.262C27.8328 85.842 27.9288 85.386 28.1208 84.894C28.3128 84.402 28.5768 83.916 28.9128 83.436C29.2488 82.956 29.6328 82.524 30.0648 82.14C30.4968 81.744 30.9588 81.426 31.4508 81.186C31.9428 80.946 32.4348 80.826 32.9268 80.826C33.4428 80.826 33.8808 80.958 34.2408 81.222C34.6008 81.486 34.7808 81.834 34.7808 82.266C34.7808 82.59 34.6668 82.824 34.4388 82.968C34.2108 83.112 33.9408 83.154 33.6288 83.094C33.6528 82.986 33.6708 82.878 33.6828 82.77C33.7068 82.662 33.7188 82.548 33.7188 82.428C33.7188 82.188 33.6708 81.972 33.5748 81.78C33.4788 81.588 33.2748 81.492 32.9628 81.492C32.6268 81.492 32.2848 81.606 31.9368 81.834C31.5888 82.062 31.2528 82.362 30.9288 82.734C30.6168 83.094 30.3348 83.496 30.0828 83.94C29.8308 84.372 29.6328 84.798 29.4888 85.218C29.3448 85.638 29.2728 86.016 29.2728 86.352C29.2728 86.736 29.4108 86.928 29.6868 86.928C29.9628 86.928 30.2688 86.796 30.6048 86.532C30.9408 86.256 31.2768 85.914 31.6128 85.506C31.9608 85.098 32.2908 84.684 32.6028 84.264C32.9148 83.832 33.1848 83.466 33.4128 83.166C33.4488 83.106 33.4968 83.076 33.5568 83.076C33.6048 83.088 33.6948 83.118 33.8268 83.166C33.9708 83.202 34.1028 83.262 34.2228 83.346C34.3428 83.43 34.4028 83.538 34.4028 83.67C34.4028 83.826 34.3188 84.042 34.1508 84.318C33.9828 84.582 33.8088 84.87 33.6288 85.182C33.4608 85.494 33.3768 85.782 33.3768 86.046C33.3768 86.202 33.4188 86.352 33.5028 86.496C33.5868 86.628 33.7248 86.694 33.9168 86.694C34.2048 86.694 34.6068 86.484 35.1228 86.064C35.6508 85.632 36.1848 84.906 36.7248 83.886L37.0668 84.228C36.6228 85.212 36.0708 86.01 35.4108 86.622C34.7508 87.234 34.0848 87.54 33.4128 87.54C32.9208 87.54 32.5548 87.384 32.3148 87.072C32.0748 86.76 31.9428 86.424 31.9188 86.064V85.974C31.4388 86.55 30.9948 87.006 30.5868 87.342C30.1908 87.678 29.7648 87.846 29.3088 87.846ZM37.6668 87.54C37.2588 87.54 36.9228 87.354 36.6588 86.982C36.4068 86.598 36.2808 86.16 36.2808 85.668C36.2808 85.332 36.3348 84.936 36.4428 84.48C36.5508 84.024 36.6888 83.58 36.8568 83.148C37.0368 82.716 37.2168 82.356 37.3968 82.068C37.5888 81.78 37.7628 81.636 37.9188 81.636C38.0028 81.636 38.1288 81.684 38.2968 81.78C38.4768 81.864 38.6328 81.972 38.7648 82.104C38.6328 82.296 38.4708 82.59 38.2788 82.986C38.0988 83.382 37.9368 83.808 37.7928 84.264C37.6488 84.72 37.5768 85.134 37.5768 85.506C37.5768 85.554 37.5828 85.668 37.5948 85.848C37.6188 86.028 37.6668 86.196 37.7388 86.352C37.8108 86.508 37.9368 86.586 38.1168 86.586C38.3208 86.586 38.5368 86.478 38.7648 86.262C39.0048 86.034 39.2448 85.746 39.4848 85.398C39.7368 85.038 39.9768 84.654 40.2048 84.246C40.4448 83.838 40.6548 83.442 40.8348 83.058C41.0268 82.674 41.1828 82.35 41.3028 82.086C41.4108 82.098 41.5488 82.128 41.7168 82.176C41.8968 82.224 42.0528 82.29 42.1848 82.374C42.3168 82.446 42.3828 82.554 42.3828 82.698C42.3828 82.734 42.3228 82.884 42.2028 83.148C42.0948 83.4 41.9628 83.706 41.8068 84.066C41.6628 84.426 41.5308 84.798 41.4108 85.182C41.3028 85.554 41.2488 85.884 41.2488 86.172C41.2488 86.34 41.2788 86.49 41.3388 86.622C41.4108 86.742 41.5428 86.802 41.7348 86.802C41.9868 86.802 42.2868 86.688 42.6348 86.46C42.9828 86.232 43.3428 85.902 43.7148 85.47C44.0868 85.038 44.4168 84.522 44.7048 83.922L44.9748 84.138C44.7108 84.786 44.3688 85.368 43.9488 85.884C43.5288 86.4 43.0788 86.802 42.5988 87.09C42.1188 87.39 41.6508 87.54 41.1948 87.54C40.8468 87.54 40.5828 87.456 40.4028 87.288C40.2348 87.132 40.1208 86.928 40.0608 86.676C40.0008 86.412 39.9648 86.148 39.9528 85.884V85.524C39.7488 85.848 39.5268 86.166 39.2868 86.478C39.0468 86.778 38.7888 87.03 38.5128 87.234C38.2488 87.438 37.9668 87.54 37.6668 87.54ZM47.5741 87.468C47.1301 87.468 46.7701 87.348 46.4941 87.108C46.2181 86.88 46.0801 86.568 46.0801 86.172C46.0801 85.836 46.1641 85.476 46.3321 85.092C46.5001 84.708 46.6681 84.33 46.8361 83.958C47.0161 83.586 47.1061 83.256 47.1061 82.968C47.1061 82.692 47.0161 82.464 46.8361 82.284C46.6561 82.092 46.4461 81.936 46.2061 81.816C45.9421 82.476 45.6421 83.118 45.3061 83.742C44.9821 84.354 44.7181 84.834 44.5141 85.182L44.2441 84.66C44.4121 84.348 44.6341 83.904 44.9101 83.328C45.1861 82.752 45.4501 82.11 45.7021 81.402C45.5821 81.282 45.5221 81.12 45.5221 80.916C45.5221 80.604 45.6181 80.31 45.8101 80.034C46.0021 79.758 46.1881 79.62 46.3681 79.62C46.5121 79.62 46.6141 79.704 46.6741 79.872C46.7461 80.028 46.7821 80.136 46.7821 80.196C46.7821 80.256 46.7521 80.364 46.6921 80.52C46.6441 80.676 46.6081 80.79 46.5841 80.862C46.5961 80.994 46.6981 81.126 46.8901 81.258C47.0941 81.378 47.3221 81.522 47.5741 81.69C47.8261 81.858 48.0481 82.068 48.2401 82.32C48.4321 82.572 48.5281 82.89 48.5281 83.274C48.5281 83.622 48.4501 83.976 48.2941 84.336C48.1381 84.696 47.9821 85.032 47.8261 85.344C47.6701 85.656 47.5921 85.926 47.5921 86.154C47.5921 86.322 47.6341 86.436 47.7181 86.496C47.8141 86.544 47.9221 86.568 48.0421 86.568C48.3301 86.568 48.6301 86.484 48.9421 86.316C49.2541 86.136 49.5601 85.908 49.8601 85.632C50.1601 85.356 50.4241 85.068 50.6521 84.768C50.8801 84.456 51.0541 84.174 51.1741 83.922L51.6061 84.246C51.3781 84.762 51.0481 85.272 50.6161 85.776C50.1841 86.268 49.7041 86.676 49.1761 87C48.6481 87.312 48.1141 87.468 47.5741 87.468ZM51.7912 87.846C51.3952 87.846 51.0532 87.714 50.7652 87.45C50.4652 87.186 50.3152 86.79 50.3152 86.262C50.3152 85.842 50.4112 85.386 50.6032 84.894C50.7952 84.402 51.0592 83.916 51.3952 83.436C51.7312 82.956 52.1152 82.524 52.5472 82.14C52.9792 81.744 53.4412 81.426 53.9332 81.186C54.4252 80.946 54.9172 80.826 55.4092 80.826C55.9252 80.826 56.3632 80.958 56.7232 81.222C57.0832 81.486 57.2632 81.834 57.2632 82.266C57.2632 82.59 57.1492 82.824 56.9212 82.968C56.6932 83.112 56.4232 83.154 56.1112 83.094C56.1352 82.986 56.1532 82.878 56.1652 82.77C56.1892 82.662 56.2012 82.548 56.2012 82.428C56.2012 82.188 56.1532 81.972 56.0572 81.78C55.9612 81.588 55.7572 81.492 55.4452 81.492C55.1092 81.492 54.7672 81.606 54.4192 81.834C54.0712 82.062 53.7352 82.362 53.4112 82.734C53.0992 83.094 52.8172 83.496 52.5652 83.94C52.3132 84.372 52.1152 84.798 51.9712 85.218C51.8272 85.638 51.7552 86.016 51.7552 86.352C51.7552 86.736 51.8932 86.928 52.1692 86.928C52.4452 86.928 52.7512 86.796 53.0872 86.532C53.4232 86.256 53.7592 85.914 54.0952 85.506C54.4432 85.098 54.7732 84.684 55.0852 84.264C55.3972 83.832 55.6672 83.466 55.8952 83.166C55.9312 83.106 55.9792 83.076 56.0392 83.076C56.0872 83.088 56.1772 83.118 56.3092 83.166C56.4532 83.202 56.5852 83.262 56.7052 83.346C56.8252 83.43 56.8852 83.538 56.8852 83.67C56.8852 83.826 56.8012 84.042 56.6332 84.318C56.4652 84.582 56.2912 84.87 56.1112 85.182C55.9432 85.494 55.8592 85.782 55.8592 86.046C55.8592 86.202 55.9012 86.352 55.9852 86.496C56.0692 86.628 56.2072 86.694 56.3992 86.694C56.6872 86.694 57.0892 86.484 57.6052 86.064C58.1332 85.632 58.6672 84.906 59.2072 83.886L59.5492 84.228C59.1052 85.212 58.5532 86.01 57.8932 86.622C57.2332 87.234 56.5672 87.54 55.8952 87.54C55.4032 87.54 55.0372 87.384 54.7972 87.072C54.5572 86.76 54.4252 86.424 54.4012 86.064V85.974C53.9212 86.55 53.4772 87.006 53.0692 87.342C52.6732 87.678 52.2472 87.846 51.7912 87.846ZM64.8473 87.36C64.3793 87.36 64.0193 87.24 63.7673 87C63.5273 86.772 63.4072 86.478 63.4072 86.118C63.4072 85.878 63.4492 85.626 63.5332 85.362C63.6173 85.086 63.7013 84.81 63.7853 84.534C63.8693 84.258 63.9113 83.994 63.9113 83.742C63.9113 83.478 63.8453 83.298 63.7133 83.202C63.5933 83.094 63.4492 83.04 63.2812 83.04C62.9213 83.04 62.5493 83.19 62.1653 83.49C61.7933 83.778 61.4273 84.144 61.0673 84.588C60.7193 85.032 60.3893 85.494 60.0773 85.974C59.7653 86.454 59.4953 86.886 59.2673 87.27C59.0393 87.27 58.8233 87.228 58.6192 87.144C58.4152 87.072 58.2412 86.94 58.0972 86.748C58.1092 86.688 58.1812 86.508 58.3132 86.208C58.4332 85.896 58.5712 85.53 58.7272 85.11C58.8833 84.678 59.0213 84.228 59.1413 83.76C59.2613 83.292 59.3213 82.866 59.3213 82.482C59.4053 82.386 59.5313 82.29 59.6993 82.194C59.8793 82.098 60.0653 82.05 60.2573 82.05C60.6773 82.05 60.8873 82.23 60.8873 82.59C60.8873 82.914 60.7853 83.448 60.5813 84.192C60.8933 83.772 61.2353 83.376 61.6073 83.004C61.9793 82.632 62.3633 82.332 62.7593 82.104C63.1673 81.864 63.5753 81.744 63.9833 81.744C64.4993 81.744 64.8773 81.918 65.1173 82.266C65.3693 82.614 65.4953 82.998 65.4953 83.418C65.4953 83.778 65.4353 84.114 65.3153 84.426C65.1953 84.738 65.0753 85.032 64.9553 85.308C64.8473 85.584 64.7933 85.854 64.7933 86.118C64.7933 86.31 64.8353 86.448 64.9193 86.532C65.0153 86.604 65.1173 86.64 65.2253 86.64C65.5133 86.64 65.8133 86.502 66.1253 86.226C66.4373 85.95 66.7313 85.602 67.0073 85.182C67.2953 84.75 67.5473 84.318 67.7633 83.886L68.0693 84.138C67.8173 84.726 67.5293 85.266 67.2053 85.758C66.8933 86.238 66.5393 86.628 66.1433 86.928C65.7593 87.216 65.3273 87.36 64.8473 87.36ZM68.9271 87.828C68.3991 87.828 67.9731 87.672 67.6491 87.36C67.3251 87.048 67.1631 86.574 67.1631 85.938C67.1631 85.446 67.2531 84.834 67.4331 84.102C67.6251 83.37 67.8651 82.614 68.1531 81.834C68.0691 81.81 67.9671 81.792 67.8471 81.78C67.7391 81.756 67.6311 81.72 67.5231 81.672V81.114C67.7151 81.138 67.8711 81.156 67.9911 81.168C68.1231 81.18 68.2551 81.192 68.3871 81.204C68.6391 80.568 68.9091 79.956 69.1971 79.368C69.4971 78.768 69.7911 78.234 70.0791 77.766C70.3791 77.298 70.6611 76.932 70.9251 76.668C71.1891 76.392 71.4231 76.254 71.6271 76.254C71.7471 76.254 71.8611 76.302 71.9691 76.398C72.0771 76.482 72.1311 76.608 72.1311 76.776C72.1311 77.016 72.0051 77.358 71.7531 77.802C71.5131 78.246 71.2131 78.768 70.8531 79.368C70.4931 79.956 70.1451 80.586 69.8091 81.258H70.3671C70.8951 81.258 71.3691 81.252 71.7891 81.24C72.2211 81.216 72.6591 81.18 73.1031 81.132V81.726C72.4431 81.786 71.8371 81.834 71.2851 81.87C70.7331 81.906 70.2051 81.93 69.7011 81.942H69.4851C69.2331 82.53 69.0111 83.136 68.8191 83.76C68.6391 84.372 68.5491 84.972 68.5491 85.56C68.5491 86.052 68.6271 86.4 68.7831 86.604C68.9391 86.808 69.1851 86.91 69.5211 86.91C70.1211 86.91 70.7331 86.64 71.3571 86.1C71.9931 85.548 72.5451 84.804 73.0131 83.868L73.2651 84.048C72.9531 84.756 72.5631 85.398 72.0951 85.974C71.6391 86.55 71.1411 87 70.6011 87.324C70.0611 87.66 69.5031 87.828 68.9271 87.828Z'
      className={`${
        color ? `${color}` : `fill-gray-800 dark:fill-white`
      } transition-colors`}
    />
    <circle
      cx='36'
      cy='35'
      r='34.5'
      className={`transition-colors fill-transparent ${
        color ? `stroke-${color}` : `stroke-gray-800 dark:stroke-white`
      }`}
    />
    <circle
      cx='36'
      cy='35'
      r='32.4'
      className={`transition-colors fill-transparent ${
        color ? `stroke-${color}` : `stroke-gray-800 dark:stroke-white`
      }`}
    />
    <defs>
      <clipPath id='clip0'>
        <rect
          width='42'
          height='42'
          transform='translate(15 14)'
          className={`transition-colors ${
            color ? `fill-${color}` : `fill-gray-800 dark:fill-white`
          }`}
        />
      </clipPath>
    </defs>
  </svg>
)

export default Logo
