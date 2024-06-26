'use client'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Link, Card } from "@nextui-org/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

interface Dados {
  c5y: number;
  cotacao: number;
  divbpatr: number;
  dy: number;
  evebit: number;
  evebitda: number;
  liq2m: number;
  liqc: number;
  mrgebit: number;
  mrgliq: number;
  pa: number;
  pacl: number;
  papel: string;
  patrliq: number;
  pcg: number;
  pebit: number;
  pl: number;
  psr: number;
  pvp: number;
  roe: number;
  roic: number;
  total: number;
  index: number;
}

function colTable() {
  return [
    { label: 'Posição', key: 'index' },
    { label: 'Papel', key: 'papel' },
    { label: 'Cotação', key: 'cotacao' },
    { label: 'P/L', key: 'pl' },
    { label: 'P/VP', key: 'pvp' },
    { label: 'Div.Yield', key: 'dy' },
    { label: 'ROE', key: 'roe' },
    { label: 'Liq. 2 meses', key: 'liq2m' },
    { label: 'Patrim. Liq.', key: 'patrliq' },
    { label: 'Div. Bruto/Patrimonio', key: 'divbpatr' },
    { label: 'Crescimento 5 Anos', key: 'c5y' },
    { label: 'Pontuação', key: 'total' },
  ];
}

function formataInteiroParaReal(numero:number) {
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const linha = 5

export default function Home() {
  const [dadosBruto, setDadosBruto] = useState<Dados[] | null>(null);

  const renderCell = useCallback((dados: Dados, columnKey: React.Key) => {
    const cellValue = dados[columnKey as keyof Dados];

    switch (columnKey) {
      case "papel":
        return (
          <Link href={`https://fundamentus.com.br/detalhes.php?papel=${dados.papel}`} target="_blank">
            <Button color="default">
              {cellValue}
            </Button>
          </Link>
        );
      case "index":
        return (
          <span>
            {dados.index}
          </span>
        );
      default:
        return (
          <span>
            {cellValue}
          </span>
        );
    } 
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Dados[]>(`${process.env.NEXT_PUBLIC_NEXTURL_SERVER}/ativo`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data:any[] = response.data
        data.forEach(acao => acao.total = 0);

        data.sort((a, b) => b.roe - a.roe);
        for (let i = 0; i < linha; i++) {
          if (data[i]) {
            data[i].total++;
          }
        }

        data.sort((a, b) => a.pl - b.pl);
        for (let i = 0; i < linha; i++) {
          if (data[i]) {
            data[i].total++;
          }
        }

        data.sort((a, b) => a.pvp - b.pvp);
        for (let i = 0; i < linha; i++) {
          if (data[i]) {
            data[i].total++;
          }
        }

        data.sort((a, b) => a.divbpatr - b.divbpatr);
        for (let i = 0; i < linha; i++) {
          if (data[i]) {
            data[i].total++;
          }
        }

        data.sort((a, b) => b.dy - a.dy);
        for (let i = 0; i < linha; i++) {
          if (data[i]) {
            data[i].total++;
          }
        }
        data.sort((a, b) => b.total - a.total);

        data.forEach((acao,index) => acao.index = index+1);

        data.map((acoes:any) => {
          
          for (const key in acoes) {

            if (typeof acoes[key] === 'number' && acoes[key].toString().includes('.')) {
              acoes[key] = parseFloat(acoes[key].toFixed(4));
            }

            if(key === 'roe'){
              acoes[key] = `${(acoes[key]*100).toFixed(4)}%`

            }else if(key === 'dy'){
              acoes[key] = `${(acoes[key]*100).toFixed(4)}%`
 
            }else if(key === 'c5y'){
              acoes[key] = `${(acoes[key]*100).toFixed(4)}%`
            }

            if(key === 'liq2m'){
              acoes[key] = formataInteiroParaReal(acoes[key])
              
            }else if(key === 'patrliq'){
              acoes[key] = formataInteiroParaReal(acoes[key])

            }else if(key === 'cotacao'){
              acoes[key] = formataInteiroParaReal(acoes[key])

            }

          }
          return acoes;
        });

        setDadosBruto(data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-2 py-2 dark text-foreground bg-background">
      {dadosBruto ? (
        <Table aria-label="Ações" color="success" selectionMode="single" defaultSelectedKeys={["2"]} className="dark:bg-black" >
          <TableHeader columns={colTable()}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={dadosBruto}>
            {(item) => (
              <TableRow key={item.papel} >
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <p>Carregando...</p>
      )}
      <Table aria-label="Regras de Classificação" className="dark:bg-black">
        <TableHeader>
          <TableColumn>PL</TableColumn>
          <TableColumn>P/VP</TableColumn>
          <TableColumn>DY</TableColumn>
          <TableColumn>ROE</TableColumn>
          <TableColumn>LIQ. 2 MESES</TableColumn>
          <TableColumn>CRESCIMENTO 5 ANOS</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key="1">
            <TableCell>Quanto menor for o PL em relação aos parametros de filtros (Entre 3 e 10 )</TableCell>
            <TableCell>Quanto menor for o P/VP em relação aos parametros de filtros (Entre 0,5 e 2 ) </TableCell>
            <TableCell>Quanto maior for o DY em relação aos parametros de filtros (Entre 7% e 15%)</TableCell>
            <TableCell>Quanto maior for o ROE em relação aos parametros de filtros (Entre 15% e 30%)</TableCell>
            <TableCell>Quanto maior for o LIQUIDAÇÃO DE 2 MESES em relação aos parametros de filtros (MAIOR OU IGUAL A 1.000.000)</TableCell>
            <TableCell>Quanto maior for o CRESCIMENTO 5 ANOS em relação aos parametros de filtros (MAIOR OU IGUAL A 10%)</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </main>
  );
}
