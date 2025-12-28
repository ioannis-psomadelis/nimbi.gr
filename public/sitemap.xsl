<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap - nimbi.gr</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          h1 { color: #333; margin-bottom: 20px; }
          .info { background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          th { background: #4a90d9; color: white; padding: 12px; text-align: left; }
          td { padding: 10px 12px; border-bottom: 1px solid #eee; }
          tr:hover { background: #f9f9f9; }
          a { color: #4a90d9; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .lang { font-size: 12px; color: #666; margin-top: 4px; }
          .priority { text-align: center; }
          .freq { text-align: center; }
        </style>
      </head>
      <body>
        <h1>nimbi.gr Sitemap</h1>
        <div class="info">
          <strong>Total URLs:</strong> <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
        </div>
        <table>
          <tr>
            <th>URL</th>
            <th style="width:100px">Priority</th>
            <th style="width:100px">Frequency</th>
          </tr>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td>
                <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                <xsl:if test="xhtml:link">
                  <div class="lang">
                    <xsl:for-each select="xhtml:link">
                      <xsl:value-of select="@hreflang"/>
                      <xsl:if test="position() != last()"> | </xsl:if>
                    </xsl:for-each>
                  </div>
                </xsl:if>
              </td>
              <td class="priority"><xsl:value-of select="sitemap:priority"/></td>
              <td class="freq"><xsl:value-of select="sitemap:changefreq"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
