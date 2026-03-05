import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: body.items,
        payer: body.payer,
        back_urls: body.back_urls,
        auto_return: body.auto_return,
        notification_url: body.notification_url,
        statement_descriptor: body.statement_descriptor,
        external_reference: body.external_reference,
        metadata: body.metadata,
      }
    });

    return Response.json({
      success: true,
      init_point: result.init_point,
      id: result.id,
    });
  } catch (error) {
    console.error('Error creating preference:', error);
    return Response.json({
      success: false, 
      message: 'Error creating preference',
    }, { status: 500 });
  }
}
