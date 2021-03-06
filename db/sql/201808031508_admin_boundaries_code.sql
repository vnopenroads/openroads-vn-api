--
-- Name: admin_boundaries; Type: COLUMN; Schema: public; Owner: -
--

ALTER TABLE admin_boundaries ADD COLUMN code text;

-- based on https://github.com/orma/openroads-vn-analytics/blob/develop/app/assets/scripts/constants.js
-- update province vpromm code.
UPDATE admin_boundaries SET code = '67' WHERE id = 113;
UPDATE admin_boundaries SET code = '03' WHERE id = 201;
UPDATE admin_boundaries SET code = '04' WHERE id = 203;
UPDATE admin_boundaries SET code = '02' WHERE id = 205;
UPDATE admin_boundaries SET code = '53' WHERE id = 207;
UPDATE admin_boundaries SET code = '09' WHERE id = 209;
UPDATE admin_boundaries SET code = '21' WHERE id = 401;
UPDATE admin_boundaries SET code = '22' WHERE id = 403;
UPDATE admin_boundaries SET code = '23' WHERE id = 405;
UPDATE admin_boundaries SET code = '25' WHERE id = 409;
UPDATE admin_boundaries SET code = '26' WHERE id = 411;
UPDATE admin_boundaries SET code = '27' WHERE id = 503;
UPDATE admin_boundaries SET code = '31' WHERE id = 507;
UPDATE admin_boundaries SET code = '24' WHERE id = 814;

-- update district vpromm code.
UPDATE admin_boundaries SET code = 'TB' WHERE id = 11501;
UPDATE admin_boundaries SET code = 'QP' WHERE id = 11503;
UPDATE admin_boundaries SET code = 'HH' WHERE id = 11505;
UPDATE admin_boundaries SET code = 'TT' WHERE id = 11507;
UPDATE admin_boundaries SET code = 'NH' WHERE id = 11509;
UPDATE admin_boundaries SET code = 'VT' WHERE id = 11511;
UPDATE admin_boundaries SET code = 'KX' WHERE id = 11513;
UPDATE admin_boundaries SET code = 'TH' WHERE id = 11515;
UPDATE admin_boundaries SET code = 'NB' WHERE id = 11701;
UPDATE admin_boundaries SET code = 'TD' WHERE id = 11703;
UPDATE admin_boundaries SET code = 'NQ' WHERE id = 11705;
UPDATE admin_boundaries SET code = 'GV' WHERE id = 11707;
UPDATE admin_boundaries SET code = 'HL' WHERE id = 11709;
UPDATE admin_boundaries SET code = 'YM' WHERE id = 11711;
UPDATE admin_boundaries SET code = 'TK' WHERE id = 11713;
UPDATE admin_boundaries SET code = 'HG' WHERE id = 20101;
UPDATE admin_boundaries SET code = 'DV' WHERE id = 20103;
UPDATE admin_boundaries SET code = 'MV' WHERE id = 20105;
UPDATE admin_boundaries SET code = 'YM' WHERE id = 20107;
UPDATE admin_boundaries SET code = 'QB' WHERE id = 20109;
UPDATE admin_boundaries SET code = 'BM' WHERE id = 20111;
UPDATE admin_boundaries SET code = 'HS' WHERE id = 20113;
UPDATE admin_boundaries SET code = 'VX' WHERE id = 20115;
UPDATE admin_boundaries SET code = 'XM' WHERE id = 20117;
UPDATE admin_boundaries SET code = 'BQ' WHERE id = 20119;
UPDATE admin_boundaries SET code = 'QG' WHERE id = 20120;
UPDATE admin_boundaries SET code = 'CB' WHERE id = 20301;
UPDATE admin_boundaries SET code = 'BC' WHERE id = 20303;
UPDATE admin_boundaries SET code = 'BM' WHERE id = 20304;
UPDATE admin_boundaries SET code = 'HQ' WHERE id = 20305;
UPDATE admin_boundaries SET code = 'TN' WHERE id = 20307;
UPDATE admin_boundaries SET code = 'TL' WHERE id = 20309;
UPDATE admin_boundaries SET code = 'TK' WHERE id = 20311;
UPDATE admin_boundaries SET code = 'NB' WHERE id = 20313;
UPDATE admin_boundaries SET code = 'HA' WHERE id = 20315;
UPDATE admin_boundaries SET code = 'QY' WHERE id = 20317;
UPDATE admin_boundaries SET code = 'PH' WHERE id = 20318;
UPDATE admin_boundaries SET code = 'HL' WHERE id = 20319;
UPDATE admin_boundaries SET code = 'TA' WHERE id = 20321;
UPDATE admin_boundaries SET code = 'LC' WHERE id = 20501;
UPDATE admin_boundaries SET code = 'MK' WHERE id = 20505;
UPDATE admin_boundaries SET code = 'BX' WHERE id = 20507;
UPDATE admin_boundaries SET code = 'SM' WHERE id = 20508;
UPDATE admin_boundaries SET code = 'BH' WHERE id = 20509;
UPDATE admin_boundaries SET code = 'BT' WHERE id = 20511;
UPDATE admin_boundaries SET code = 'SP' WHERE id = 20513;
UPDATE admin_boundaries SET code = 'BY' WHERE id = 20515;
UPDATE admin_boundaries SET code = 'VB' WHERE id = 20519;
UPDATE admin_boundaries SET code = 'LS' WHERE id = 20901;
UPDATE admin_boundaries SET code = 'TD' WHERE id = 20903;
UPDATE admin_boundaries SET code = 'VL' WHERE id = 20905;
UPDATE admin_boundaries SET code = 'BG' WHERE id = 20907;
UPDATE admin_boundaries SET code = 'BS' WHERE id = 20909;
UPDATE admin_boundaries SET code = 'VQ' WHERE id = 20911;
UPDATE admin_boundaries SET code = 'CA' WHERE id = 20913;
UPDATE admin_boundaries SET code = 'LB' WHERE id = 20915;
UPDATE admin_boundaries SET code = 'CH' WHERE id = 20917;
UPDATE admin_boundaries SET code = 'DL' WHERE id = 20919;
UPDATE admin_boundaries SET code = 'HL' WHERE id = 20921;
UPDATE admin_boundaries SET code = 'TQ' WHERE id = 21101;
UPDATE admin_boundaries SET code = 'NH' WHERE id = 21103;
UPDATE admin_boundaries SET code = 'CH' WHERE id = 21105;
UPDATE admin_boundaries SET code = 'HY' WHERE id = 21107;
UPDATE admin_boundaries SET code = 'YS' WHERE id = 21109;
UPDATE admin_boundaries SET code = 'SD' WHERE id = 21111;
UPDATE admin_boundaries SET code = 'YB' WHERE id = 21301;
UPDATE admin_boundaries SET code = 'NL' WHERE id = 21303;
UPDATE admin_boundaries SET code = 'LC' WHERE id = 21305;
UPDATE admin_boundaries SET code = 'VC' WHERE id = 21307;
UPDATE admin_boundaries SET code = 'MC' WHERE id = 21309;
UPDATE admin_boundaries SET code = 'TY' WHERE id = 21311;
UPDATE admin_boundaries SET code = 'VC' WHERE id = 21315;
UPDATE admin_boundaries SET code = 'TT' WHERE id = 21317;
UPDATE admin_boundaries SET code = 'HL' WHERE id = 22501;
UPDATE admin_boundaries SET code = 'CP' WHERE id = 22503;
UPDATE admin_boundaries SET code = 'UB' WHERE id = 22505;
UPDATE admin_boundaries SET code = 'MC' WHERE id = 22506;
UPDATE admin_boundaries SET code = 'BL' WHERE id = 22507;
UPDATE admin_boundaries SET code = 'HH' WHERE id = 22511;
UPDATE admin_boundaries SET code = 'DH' WHERE id = 22512;
UPDATE admin_boundaries SET code = 'TY' WHERE id = 22513;
UPDATE admin_boundaries SET code = 'BC' WHERE id = 22515;
UPDATE admin_boundaries SET code = 'VP' WHERE id = 22517;
UPDATE admin_boundaries SET code = 'HB' WHERE id = 22519;
UPDATE admin_boundaries SET code = 'DT' WHERE id = 22521;
UPDATE admin_boundaries SET code = 'CT' WHERE id = 22523;
UPDATE admin_boundaries SET code = 'YH' WHERE id = 22525;
UPDATE admin_boundaries SET code = 'LC' WHERE id = 30103;
UPDATE admin_boundaries SET code = 'MT' WHERE id = 30105;
UPDATE admin_boundaries SET code = 'PT' WHERE id = 30107;
UPDATE admin_boundaries SET code = 'TD' WHERE id = 30108;
UPDATE admin_boundaries SET code = 'SH' WHERE id = 30109;
UPDATE admin_boundaries SET code = 'TU' WHERE id = 30117;
UPDATE admin_boundaries SET code = 'SL' WHERE id = 30301;
UPDATE admin_boundaries SET code = 'QN' WHERE id = 30303;
UPDATE admin_boundaries SET code = 'ML' WHERE id = 30305;
UPDATE admin_boundaries SET code = 'TC' WHERE id = 30307;
UPDATE admin_boundaries SET code = 'BY' WHERE id = 30309;
UPDATE admin_boundaries SET code = 'PY' WHERE id = 30311;
UPDATE admin_boundaries SET code = 'MS' WHERE id = 30313;
UPDATE admin_boundaries SET code = 'SM' WHERE id = 30315;
UPDATE admin_boundaries SET code = 'SC' WHERE id = 30316;
UPDATE admin_boundaries SET code = 'YC' WHERE id = 30317;
UPDATE admin_boundaries SET code = 'MC' WHERE id = 30319;
UPDATE admin_boundaries SET code = 'HB' WHERE id = 30501;
UPDATE admin_boundaries SET code = 'DR' WHERE id = 30503;
UPDATE admin_boundaries SET code = 'MC' WHERE id = 30505;
UPDATE admin_boundaries SET code = 'KS' WHERE id = 30507;
UPDATE admin_boundaries SET code = 'LG' WHERE id = 30509;
UPDATE admin_boundaries SET code = 'CP' WHERE id = 30510;
UPDATE admin_boundaries SET code = 'KB' WHERE id = 30511;
UPDATE admin_boundaries SET code = 'TL' WHERE id = 30513;
UPDATE admin_boundaries SET code = 'LC' WHERE id = 30515;
UPDATE admin_boundaries SET code = 'LT' WHERE id = 30517;
UPDATE admin_boundaries SET code = 'YT' WHERE id = 30519;
UPDATE admin_boundaries SET code = 'TH' WHERE id = 40101;
UPDATE admin_boundaries SET code = 'BS' WHERE id = 40103;
UPDATE admin_boundaries SET code = 'SS' WHERE id = 40105;
UPDATE admin_boundaries SET code = 'ML' WHERE id = 40107;
UPDATE admin_boundaries SET code = 'QH' WHERE id = 40109;
UPDATE admin_boundaries SET code = 'QS' WHERE id = 40111;
UPDATE admin_boundaries SET code = 'BT' WHERE id = 40113;
UPDATE admin_boundaries SET code = 'CT' WHERE id = 40115;
UPDATE admin_boundaries SET code = 'LC' WHERE id = 40117;
UPDATE admin_boundaries SET code = 'TT' WHERE id = 40119;
UPDATE admin_boundaries SET code = 'NL' WHERE id = 40121;
UPDATE admin_boundaries SET code = 'TN' WHERE id = 40123;
UPDATE admin_boundaries SET code = 'NX' WHERE id = 40125;
UPDATE admin_boundaries SET code = 'NT' WHERE id = 40127;
UPDATE admin_boundaries SET code = 'VL' WHERE id = 40129;
UPDATE admin_boundaries SET code = 'HT' WHERE id = 40131;
UPDATE admin_boundaries SET code = 'NS' WHERE id = 40133;
UPDATE admin_boundaries SET code = 'YD' WHERE id = 40135;
UPDATE admin_boundaries SET code = 'TX' WHERE id = 40137;
UPDATE admin_boundaries SET code = 'HL' WHERE id = 40139;
UPDATE admin_boundaries SET code = 'TU' WHERE id = 40141;
UPDATE admin_boundaries SET code = 'HH' WHERE id = 40143;
UPDATE admin_boundaries SET code = 'DS' WHERE id = 40145;
UPDATE admin_boundaries SET code = 'TS' WHERE id = 40147;
UPDATE admin_boundaries SET code = 'QX' WHERE id = 40149;
UPDATE admin_boundaries SET code = 'NC' WHERE id = 40151;
UPDATE admin_boundaries SET code = 'TG' WHERE id = 40153;
UPDATE admin_boundaries SET code = 'VI' WHERE id = 40301;
UPDATE admin_boundaries SET code = 'CL' WHERE id = 40303;
UPDATE admin_boundaries SET code = 'QP' WHERE id = 40305;
UPDATE admin_boundaries SET code = 'QC' WHERE id = 40307;
UPDATE admin_boundaries SET code = 'KS' WHERE id = 40309;
UPDATE admin_boundaries SET code = 'QH' WHERE id = 40311;
UPDATE admin_boundaries SET code = 'NG' WHERE id = 40313;
UPDATE admin_boundaries SET code = 'TD' WHERE id = 40315;
UPDATE admin_boundaries SET code = 'QL' WHERE id = 40317;
UPDATE admin_boundaries SET code = 'TK' WHERE id = 40319;
UPDATE admin_boundaries SET code = 'CC' WHERE id = 40321;
UPDATE admin_boundaries SET code = 'YT' WHERE id = 40323;
UPDATE admin_boundaries SET code = 'DC' WHERE id = 40325;
UPDATE admin_boundaries SET code = 'AS' WHERE id = 40327;
UPDATE admin_boundaries SET code = 'DL' WHERE id = 40329;
UPDATE admin_boundaries SET code = 'TC' WHERE id = 40331;
UPDATE admin_boundaries SET code = 'NL' WHERE id = 40333;
UPDATE admin_boundaries SET code = 'ND' WHERE id = 40335;
UPDATE admin_boundaries SET code = 'HN' WHERE id = 40337;
UPDATE admin_boundaries SET code = 'HT' WHERE id = 40501;
UPDATE admin_boundaries SET code = 'HL' WHERE id = 40503;
UPDATE admin_boundaries SET code = 'NX' WHERE id = 40505;
UPDATE admin_boundaries SET code = 'DT' WHERE id = 40507;
UPDATE admin_boundaries SET code = 'HS' WHERE id = 40509;
UPDATE admin_boundaries SET code = 'VQ' WHERE id = 40510;
UPDATE admin_boundaries SET code = 'CL' WHERE id = 40511;
UPDATE admin_boundaries SET code = 'TH' WHERE id = 40513;
UPDATE admin_boundaries SET code = 'CX' WHERE id = 40515;
UPDATE admin_boundaries SET code = 'HK' WHERE id = 40517;
UPDATE admin_boundaries SET code = 'KA' WHERE id = 40519;
UPDATE admin_boundaries SET code = 'DH' WHERE id = 40701;
UPDATE admin_boundaries SET code = 'TH' WHERE id = 40703;
UPDATE admin_boundaries SET code = 'MH' WHERE id = 40705;
UPDATE admin_boundaries SET code = 'QT' WHERE id = 40707;
UPDATE admin_boundaries SET code = 'BT' WHERE id = 40709;
UPDATE admin_boundaries SET code = 'QN' WHERE id = 40711;
UPDATE admin_boundaries SET code = 'LT' WHERE id = 40713;
UPDATE admin_boundaries SET code = 'DH' WHERE id = 40901;
UPDATE admin_boundaries SET code = 'QT' WHERE id = 40903;
UPDATE admin_boundaries SET code = 'VL' WHERE id = 40905;
UPDATE admin_boundaries SET code = 'CC' WHERE id = 40906;
UPDATE admin_boundaries SET code = 'GL' WHERE id = 40907;
UPDATE admin_boundaries SET code = 'CL' WHERE id = 40909;
UPDATE admin_boundaries SET code = 'TP' WHERE id = 40911;
UPDATE admin_boundaries SET code = 'HL' WHERE id = 40913;
UPDATE admin_boundaries SET code = 'HH' WHERE id = 40915;
UPDATE admin_boundaries SET code = 'DA' WHERE id = 40917;
UPDATE admin_boundaries SET code = 'HE' WHERE id = 41101;
UPDATE admin_boundaries SET code = 'PD' WHERE id = 41103;
UPDATE admin_boundaries SET code = 'QD' WHERE id = 41105;
UPDATE admin_boundaries SET code = 'HR' WHERE id = 41107;
UPDATE admin_boundaries SET code = 'PV' WHERE id = 41109;
UPDATE admin_boundaries SET code = 'HU' WHERE id = 41111;
UPDATE admin_boundaries SET code = 'PL' WHERE id = 41113;
UPDATE admin_boundaries SET code = 'AL' WHERE id = 41115;
UPDATE admin_boundaries SET code = 'ND' WHERE id = 41117;
UPDATE admin_boundaries SET code = 'TK' WHERE id = 50301;
UPDATE admin_boundaries SET code = 'HA' WHERE id = 50303;
UPDATE admin_boundaries SET code = 'TG' WHERE id = 50304;
UPDATE admin_boundaries SET code = 'DG' WHERE id = 50305;
UPDATE admin_boundaries SET code = 'DL' WHERE id = 50307;
UPDATE admin_boundaries SET code = 'DB' WHERE id = 50309;
UPDATE admin_boundaries SET code = 'DX' WHERE id = 50311;
UPDATE admin_boundaries SET code = 'NG' WHERE id = 50313;
UPDATE admin_boundaries SET code = 'TB' WHERE id = 50315;
UPDATE admin_boundaries SET code = 'QS' WHERE id = 50317;
UPDATE admin_boundaries SET code = 'HD' WHERE id = 50319;
UPDATE admin_boundaries SET code = 'TP' WHERE id = 50321;
UPDATE admin_boundaries SET code = 'PS' WHERE id = 50323;
UPDATE admin_boundaries SET code = 'NT' WHERE id = 50325;
UPDATE admin_boundaries SET code = 'BT' WHERE id = 50327;
UPDATE admin_boundaries SET code = 'NM' WHERE id = 50328;
UPDATE admin_boundaries SET code = 'PN' WHERE id = 50329;
UPDATE admin_boundaries SET code = 'QN' WHERE id = 50501;
UPDATE admin_boundaries SET code = 'LS' WHERE id = 50503;
UPDATE admin_boundaries SET code = 'BS' WHERE id = 50505;
UPDATE admin_boundaries SET code = 'TB' WHERE id = 50507;
UPDATE admin_boundaries SET code = 'TT' WHERE id = 50508;
UPDATE admin_boundaries SET code = 'SN' WHERE id = 50509;
UPDATE admin_boundaries SET code = 'SY' WHERE id = 50511;
UPDATE admin_boundaries SET code = 'SH' WHERE id = 50513;
UPDATE admin_boundaries SET code = 'TN' WHERE id = 50515;
UPDATE admin_boundaries SET code = 'NH' WHERE id = 50517;
UPDATE admin_boundaries SET code = 'ML' WHERE id = 50519;
UPDATE admin_boundaries SET code = 'MD' WHERE id = 50521;
UPDATE admin_boundaries SET code = 'DP' WHERE id = 50523;
UPDATE admin_boundaries SET code = 'BT' WHERE id = 50525;
UPDATE admin_boundaries SET code = 'QN' WHERE id = 50701;
UPDATE admin_boundaries SET code = 'AL' WHERE id = 50703;
UPDATE admin_boundaries SET code = 'HN' WHERE id = 50705;
UPDATE admin_boundaries SET code = 'HA' WHERE id = 50707;
UPDATE admin_boundaries SET code = 'MN' WHERE id = 50709;
UPDATE admin_boundaries SET code = 'VT' WHERE id = 50711;
UPDATE admin_boundaries SET code = 'PC' WHERE id = 50713;
UPDATE admin_boundaries SET code = 'TS' WHERE id = 50715;
UPDATE admin_boundaries SET code = 'AN' WHERE id = 50717;
UPDATE admin_boundaries SET code = 'TP' WHERE id = 50719;
UPDATE admin_boundaries SET code = 'VC' WHERE id = 50721;
UPDATE admin_boundaries SET code = 'TH' WHERE id = 50901;
UPDATE admin_boundaries SET code = 'DX' WHERE id = 50903;
UPDATE admin_boundaries SET code = 'SC' WHERE id = 50905;
UPDATE admin_boundaries SET code = 'TA' WHERE id = 50907;
UPDATE admin_boundaries SET code = 'SO' WHERE id = 50909;
UPDATE admin_boundaries SET code = 'PH' WHERE id = 50910;
UPDATE admin_boundaries SET code = 'TH' WHERE id = 50911;
UPDATE admin_boundaries SET code = 'SH' WHERE id = 50912;
UPDATE admin_boundaries SET code = 'SH' WHERE id = 50913;
UPDATE admin_boundaries SET code = 'NT' WHERE id = 51101;
UPDATE admin_boundaries SET code = 'CR' WHERE id = 51102;
UPDATE admin_boundaries SET code = 'VN' WHERE id = 51103;
UPDATE admin_boundaries SET code = 'NH' WHERE id = 51105;
UPDATE admin_boundaries SET code = 'DK' WHERE id = 51107;
UPDATE admin_boundaries SET code = 'KV' WHERE id = 51111;
UPDATE admin_boundaries SET code = 'KS' WHERE id = 51113;
UPDATE admin_boundaries SET code = 'KT' WHERE id = 60101;
UPDATE admin_boundaries SET code = 'DG' WHERE id = 60103;
UPDATE admin_boundaries SET code = 'NH' WHERE id = 60105;
UPDATE admin_boundaries SET code = 'DT' WHERE id = 60107;
UPDATE admin_boundaries SET code = 'KR' WHERE id = 60108;
UPDATE admin_boundaries SET code = 'KP' WHERE id = 60109;
UPDATE admin_boundaries SET code = 'DH' WHERE id = 60111;
UPDATE admin_boundaries SET code = 'ST' WHERE id = 60113;
UPDATE admin_boundaries SET code = 'PL' WHERE id = 60301;
UPDATE admin_boundaries SET code = 'KB' WHERE id = 60303;
UPDATE admin_boundaries SET code = 'DD' WHERE id = 60305;
UPDATE admin_boundaries SET code = 'MY' WHERE id = 60306;
UPDATE admin_boundaries SET code = 'CH' WHERE id = 60307;
UPDATE admin_boundaries SET code = 'IG' WHERE id = 60309;
UPDATE admin_boundaries SET code = 'AK' WHERE id = 60311;
UPDATE admin_boundaries SET code = 'DP' WHERE id = 60312;
UPDATE admin_boundaries SET code = 'KC' WHERE id = 60313;
UPDATE admin_boundaries SET code = 'DC' WHERE id = 60315;
UPDATE admin_boundaries SET code = 'CG' WHERE id = 60317;
UPDATE admin_boundaries SET code = 'CS' WHERE id = 60319;
UPDATE admin_boundaries SET code = 'AP' WHERE id = 60321;
UPDATE admin_boundaries SET code = 'IP' WHERE id = 60322;
UPDATE admin_boundaries SET code = 'KP' WHERE id = 60323;
UPDATE admin_boundaries SET code = 'BM' WHERE id = 60501;
UPDATE admin_boundaries SET code = 'EH' WHERE id = 60503;
UPDATE admin_boundaries SET code = 'ES' WHERE id = 60505;
UPDATE admin_boundaries SET code = 'KN' WHERE id = 60507;
UPDATE admin_boundaries SET code = 'KK' WHERE id = 60509;
UPDATE admin_boundaries SET code = 'BD' WHERE id = 60511;
UPDATE admin_boundaries SET code = 'BD' WHERE id = 60513;
UPDATE admin_boundaries SET code = 'EK' WHERE id = 60515;
UPDATE admin_boundaries SET code = 'MD' WHERE id = 60517;
UPDATE admin_boundaries SET code = 'KP' WHERE id = 60519;
UPDATE admin_boundaries SET code = 'KA' WHERE id = 60523;
UPDATE admin_boundaries SET code = 'KB' WHERE id = 60525;
UPDATE admin_boundaries SET code = 'LA' WHERE id = 60531;
UPDATE admin_boundaries SET code = 'DT' WHERE id = 81014;
UPDATE admin_boundaries SET code = 'DH' WHERE id = 81410;
 
 