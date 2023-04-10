import axios from 'axios';

export function zplToPng(zpl: string, dpmm: number): Promise<string | void> {
  return axios
    .post(
      `http://api.labelary.com/v1/printers/${dpmm}dpmm/labels/4x6/0/`,
      zpl,
      {
        responseType: 'arraybuffer',
      }
    )
    .then((res) => Buffer.from(res.data).toString('base64'));
}
