<?php
$basePath = dirname(__DIR__);
$pool = [];
foreach(glob($basePath . '/raw/*.json') AS $jsonFile) {
    $json = json_decode(file_get_contents($jsonFile), true);
    foreach($json['features'] AS $f) {
        $pool[] = [
            "market_name" => $f['attributes']['market_name'],
            "addr" => $f['attributes']['addr'],
            "business_week" => $f['attributes']['business_week'],
            "context" => strip_tags($f['attributes']['context']),
            "ValidDate" => date('Y-m-d', $f['attributes']['ValidDate'] / 1000),
            "Lontitude" => $f['attributes']['Lontitude'],
            "Latitude" => $f['attributes']['Latitude'],
            "case_code" => $f['attributes']['case_code'],
            "last_edited_date" => date('Y-m-d H:i:s', $f['attributes']['last_edited_date'] / 1000),
            "type" => $f['attributes']['type'],
            "badge_code" => $f['attributes']['badge_code'],
            "business_hours" => $f['attributes']['business_hours'],
            "business_hours_end" => $f['attributes']['business_hours_end'],
        ];
    }
}
file_put_contents($basePath . '/data.json', json_encode($pool, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));