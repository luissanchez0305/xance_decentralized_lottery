import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Strating to seed');

    try {
        await prisma.lottery.createMany({
            data: [{
                contractHash: '0x2b902401C06eC318Debd857af14919DC775c552c',
                lotteryDate: new Date('2023-10-07T16:40:00Z'),
                tokenHash: '0x91A018284b0beD0CA534eBdd70C58C7ede99d427',
                createdDate: new Date('2023-10-06T16:40:00Z'),
                country: 'Colombia',
            },{
                contractHash: '0xEbCa8d368c15d3E4Efa82314dE4D1BbEeC260811',
                lotteryDate: new Date('2023-10-07T17:00:00Z'),
                tokenHash: '0x91A018284b0beD0CA534eBdd70C58C7ede99d427',
                createdDate: new Date('2023-10-07T16:20:00Z'),
                country: 'Colombia',
            },{
                contractHash: '0x5b8796AAF22Af37075B00aC1801C10DC79632092',
                lotteryDate: new Date('2023-10-08T17:00:00Z'),
                tokenHash: '0x91A018284b0beD0CA534eBdd70C58C7ede99d427',
                createdDate: new Date('2023-10-08T16:30:00Z'),
                country: 'Colombia',
            },{
                contractHash: '0xd0B9E8E87064E24d475b2B7C5699F68702E650Ce',
                lotteryDate: new Date('2024-03-17T17:00:00Z'),
                tokenHash: '0x91A018284b0beD0CA534eBdd70C58C7ede99d427',
                createdDate: new Date('2024-03-17T16:30:00Z'),
                country: 'Colombia',
            },{
                contractHash: '0x32ccEa5E31d425885E67d9cEF535bD90F367fefA',
                lotteryDate: new Date('2024-03-18T17:00:00Z'),
                tokenHash: '0x91A018284b0beD0CA534eBdd70C58C7ede99d427',
                createdDate: new Date('2024-03-18T16:20:00Z'),
                country: 'Colombia',
            }]
        });
    }
    catch (error) {
        console.log(error);
    }
    console.log('Seeding finished');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });