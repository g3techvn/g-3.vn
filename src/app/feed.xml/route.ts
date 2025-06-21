import { NextResponse } from 'next/server';
import { COMPANY_INFO } from '@/constants';

// Cache the RSS feed for 1 hour
export const revalidate = 3600;

export async function GET() {
  try {
    const siteUrl = COMPANY_INFO.website;
    const now = new Date().toISOString();
    
    // In a real application, you would fetch this data from your database
    // For now, we'll create a sample RSS feed with static content
    const feedItems = [
      {
        title: 'Ghế Công Thái Học - Xu Hướng Nội Thất Văn Phòng 2024',
        description: 'Khám phá những xu hướng mới nhất trong thiết kế ghế công thái học cho văn phòng hiện đại',
        link: `${siteUrl}/noi-dung/ghe-cong-thai-hoc-xu-huong-2024`,
        pubDate: new Date('2024-01-15').toISOString(),
        category: 'Nội thất văn phòng',
      },
      {
        title: 'Bàn Điều Chỉnh Độ Cao - Giải Pháp Cho Sức Khỏe Văn Phòng',
        description: 'Tìm hiểu về lợi ích của bàn điều chỉnh độ cao và cách chọn bàn phù hợp',
        link: `${siteUrl}/noi-dung/ban-dieu-chinh-do-cao-suc-khoe`,
        pubDate: new Date('2024-01-10').toISOString(),
        category: 'Sức khỏe văn phòng',
      },
      {
        title: 'Chính Sách Bảo Hành G3 - Cam Kết Chất Lượng',
        description: 'Thông tin chi tiết về chính sách bảo hành và dịch vụ hậu mãi tại G3',
        link: `${siteUrl}/noi-dung/chinh-sach-bao-hanh-g3`,
        pubDate: new Date('2024-01-05').toISOString(),
        category: 'Chính sách',
      },
      {
        title: 'Ghế Gaming Ergonomic - Sự Kết Hợp Hoàn Hảo',
        description: 'Khám phá dòng ghế gaming với thiết kế công thái học cho game thủ chuyên nghiệp',
        link: `${siteUrl}/categories/ghe-gaming`,
        pubDate: new Date('2024-01-01').toISOString(),
        category: 'Gaming',
      },
      {
        title: 'Nội Thất Văn Phòng Thông Minh - Tương Lai Của Workspace',
        description: 'Xu hướng nội thất văn phòng thông minh và ứng dụng công nghệ trong thiết kế',
        link: `${siteUrl}/noi-dung/noi-that-van-phong-thong-minh`,
        pubDate: new Date('2023-12-28').toISOString(),
        category: 'Công nghệ',
      }
    ];

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>G3 - Công Thái Học | Nội thất văn phòng chất lượng cao</title>
    <link>${siteUrl}</link>
    <description>Chuyên cung cấp nội thất văn phòng với thiết kế công thái học chất lượng cao. Ghế ergonomic, bàn điều chỉnh độ cao, giải pháp sức khỏe văn phòng.</description>
    <language>vi-VN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js RSS Generator</generator>
    <webMaster>${COMPANY_INFO.email} (G3 Vietnam)</webMaster>
    <managingEditor>${COMPANY_INFO.email} (G3 Vietnam)</managingEditor>
    <copyright>Copyright ${new Date().getFullYear()} G3 Vietnam. All rights reserved.</copyright>
    <category>Nội thất văn phòng</category>
    <category>Công thái học</category>
    <category>Sức khỏe văn phòng</category>
    <ttl>60</ttl>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>G3 - Công Thái Học</title>
      <link>${siteUrl}</link>
      <width>144</width>
      <height>144</height>
      <description>Logo G3 - Nội thất công thái học</description>
    </image>
${feedItems.map(item => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <category><![CDATA[${item.category}]]></category>
      <author>${COMPANY_INFO.email} (G3 Vietnam)</author>
    </item>`).join('\n')}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
} 