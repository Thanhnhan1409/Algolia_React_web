import React, { useState } from 'react';
import Header from '../components/layouts/Header';
import CardItem from '../components/CardItem';
import { Divider, Pagination, Select } from 'antd';
import { items } from '../data/cardData';
import { ReloadOutlined } from '@ant-design/icons';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(16);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  return (
    <div>
      <Header />
      <main className="flex max-w-[1300px] mx-[auto] py-8 px-4">
        <nav className="w-[260px] mr-[60px] flex flex-col">
          <div className="flex justify-between items-baseline h-fit min-h-[80px]">
            <h1 className="font-bold text-2xl">Filter</h1>
            <div className="flex gap-2 items-center">
              <ReloadOutlined style={{fontSize: '10px'}}/>
              <p className="text-xs text-[rgba(33,36,61,.5)]">Refresh Filter</p>
            </div>
          </div>
          <Divider style={{margin: 0}} />
        </nav>
        <div className="w-[946px]">
          <div className="mt-8 mb-1.5 text-end">
            <Select
              defaultValue="featured"
              style={{ width: 150 }}
              onChange={() => console.log('Sort changed')}
              variant="borderless"
              options={[
                { value: 'featured', label: 'Sort by featured' },
                { value: 'asc', label: 'Price Ascending' },
                { value: 'des', label: 'Price Descending' },
              ]}
            />
            <Select
              defaultValue={16}
              style={{ width: 150 }}
              onChange={handlePageSizeChange}
              variant="borderless"
              options={[
                { value: 16, label: '16 hits per page' },
                { value: 32, label: '32 hits per page' },
                { value: 64, label: '64 hits per page' },
              ]}
            />
          </div>
          <Divider />
          <div>
            <div className="grid grid-cols-4 gap-12">
              {paginatedItems.map((item, index) => (
                <CardItem item={item} key={index} />
              ))}
            </div>
            <Pagination
              align="center"
              current={currentPage}
              pageSize={pageSize}
              total={items.length}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
