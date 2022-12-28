const abstractText = (txt: string, txtLength: number) =>
  txt?.length > txtLength ? txt.slice(0, txtLength) + '...' : txt

export default abstractText
