import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Divider, Pagination, Rate, Select, Slider, Switch, Input, Checkbox } from 'antd';
import { ReloadOutlined, CaretDownOutlined , CaretUpOutlined, SearchOutlined } from '@ant-design/icons';

import Header from '../components/layouts/Header';
import CardItem from '../components/CardItem';
import './HomePage.scss';
import { Product, Category, Filter, BrandOption, ResponseData } from '../types';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(16);
  const [activeItem, setActiveItem] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [queryFilter, setQueryFilter] = useState<Filter>({freeShipping: true});
  const [paginatedItems, setPaginatedItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<ResponseData>({});
  const [ratings, setRatings] = useState<ResponseData>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([Infinity, -Infinity]);
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);

  const toggleCategory = (value: string) => {
    onFilterChange('category', value );
    setActiveItem((prev) => (prev === value ? '' : value));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setActiveItem(-1);
  }

  const onFilterChange = (key: string, value: any) => {
    setQueryFilter({
      ...queryFilter, [key]: value
    });
  }

  const fetchData = async () => {
    try {
      let stringFilter = '';
    if (queryFilter.search) {
      stringFilter += `&q=${queryFilter.search}`;
    }
    if (queryFilter.category) {
      stringFilter += `&category=${queryFilter.category}`;
    }
    if (queryFilter.priceRange) {
      stringFilter += `&priceRange=${queryFilter.priceRange}`;
    }
    if (queryFilter.rating) {
      stringFilter += `&rating=${queryFilter.rating}`;
    }
    if (queryFilter.brand) {
      stringFilter += `&brand=${queryFilter.brand}`;
    }
    if (queryFilter.freeShipping) {
      stringFilter += `&freeShipping=${queryFilter.freeShipping}`;
    }
    const params = new URLSearchParams();

    if (queryFilter.search) params.append("name", queryFilter.search);
    if (queryFilter.brand?.length) queryFilter.brand.forEach((brand) => params.append("brand", brand));
    if (queryFilter.category) params.append("categories", queryFilter.category);
    if (queryFilter.priceRange) params.append("price_gte", queryFilter.priceRange[0].toString());
    if (queryFilter.priceRange?.length === 2) params.append("price_lte", queryFilter.priceRange[1].toString());
    // if (queryFilter.freeShipping === false) params.append("freeShipping", "false")
    //   else params.append("freeShipping", "true");
    const res = await axios.get(`http://localhost:3000/products?${params.toString()}`);
    console.log('brands',res.data?.map((product: Product) => product.brand));
    const tmpList: string[] = Array.from(
      new Set(res.data?.map((product: Product) => product.brand))
    )
    const brandsData: BrandOption[] = tmpList.map((uniqueBrand) => ({
      label: uniqueBrand,
      value: uniqueBrand,
    }));
    // setBrands(brandsData);
    setProducts(res.data);
    console.log(res.data);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedList = res.data.slice(startIndex, startIndex + pageSize);
    setPaginatedItems(paginatedList);
    console.log('Query filter changed', paginatedList);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchAllData = async () => {
    try {
      const productRes = await axios.get('http://localhost:3000/products');
      const categoryRes = await axios.get('http://localhost:3000/categories');

      setCategories(categoryRes.data);
      setProducts(productRes.data);
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedList = productRes.data.slice(startIndex, startIndex + pageSize);
      setPaginatedItems(paginatedList);
      getSubDataFromProduct(productRes.data);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchFilterData = async () => {
    console.log('111');
    
    try {
      let res
      const params = new URLSearchParams();
      if (queryFilter.priceRange) params.append("price_gte", queryFilter.priceRange[0].toString());
      if (queryFilter.priceRange?.length === 2) params.append("price_lte", queryFilter.priceRange[1].toString());
      if (queryFilter.rating) params.append("rating", queryFilter.rating.toString());
      if (!queryFilter.freeShipping) params.append("free_shipping", "false")
        else params.append("freeShipping", "true");
      if(queryFilter?.rating || queryFilter?.priceRange?.length === 2 || queryFilter?.brand?.length) {
        res = await axios.get(`http://localhost:3000/products?${params.toString()}`);
      }
      let filterProducts: Product[] = res?.data || products; 
      if (queryFilter?.search) {
        console.log('queryFilter.search', queryFilter.search);
        
        filterProducts = filterProducts.filter((product) => product.name.includes(queryFilter.search ?? ''));
        console.log('filterProducts', filterProducts);
        console.log('filterProducts', filterProducts.length);
        
        
        setProducts(filterProducts);
        getSubDataFromProduct(filterProducts);
      }
      if (queryFilter?.category) {
        console.log(222);
        
        filterProducts = filterProducts.filter((product) => product.categories.includes(queryFilter.category ?? ''));
      }
      if (queryFilter?.brand?.length) {
        console.log(444);
        
        filterProducts = filterProducts.filter((product) => queryFilter.brand?.includes(product.brand));
      }
      getSubDataFromProduct(filterProducts);
      setProducts(filterProducts);
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedList = filterProducts.slice(startIndex, startIndex + pageSize);
      setPaginatedItems(paginatedList);
    } catch (error) {
      console.log(error);
    }
  }

  const getSubDataFromProduct = (products: Product[]) => {
    const brandCount: { [key: string]: number } = {};
      let minPrice = Infinity;
      let maxPrice = -Infinity;
  
      products.forEach((product: Product) => {
        brandCount[product.brand] = (brandCount[product.brand] || 0) + 1;
  
        if (product.price < minPrice) minPrice = product.price;
        if (product.price > maxPrice) maxPrice = product.price;
  
        if (product.rating >= 1 && product.rating <= 5) {
          ratings[product.rating] += 1;
        }
      });
      const brandsParse = Object.keys(brandCount).map((key) => ({
        label: key,
        value: key,
      }));
      setRatings({ ...ratings });
      setPriceRange([minPrice, maxPrice]);
      setBrands(brandCount);
      setBrandOptions(brandsParse);
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchFilterData()
    // let dataFilter: Product[] = [];
    // if(queryFilter.search) {
    //   dataFilter = products.filter((product) => product.name.includes(queryFilter.search ?? ''));
    // }
  }, [queryFilter]);

  useEffect (() => {
    setPaginatedItems(products.slice((currentPage - 1) * pageSize, currentPage * pageSize));
  }, [currentPage, pageSize]);

  return (
    <div>
      <Header onSearchChange={onFilterChange} />
      <main className="flex max-w-[1300px] mx-[auto] py-8 px-4">
        <nav className="w-[260px] mr-[60px] flex flex-col">
          <div className="flex justify-between h-fit min-h-[80px] mb-2">
            <h1 className="font-semibold text-2xl text-center my-[auto]">Filters</h1>
            <div className="flex gap-2 items-center">
              <ReloadOutlined style={{fontSize: '10px'}}/>
              <p className="text-xs text-[rgba(33,36,61,.5)] cursor-pointer" onClick={handleClearFilter}>Refresh Filter</p>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Category</h2>
            <ul className="mt-2">
              {
                categories.slice().map((category, index) => (
                  <li key={index} className="mb-3" >
                    <div
                      className={`flex items-center gap-2 cursor-pointer ${(activeItem === category.name  || category.subcategories?.find((item) => item.name === activeItem)) && 'font-semibold'} `}
                      onClick={() => toggleCategory(category.name)}
                    >
                      {activeItem === category.name ? (
                        <CaretDownOutlined style={{ color: "grey", fontSize: "8px" }} />
                      ) : (
                        <CaretUpOutlined style={{ color: "grey", fontSize: "8px" }} />
                      )}
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        <div className="text-xs font-semibold p-0.5 rounded bg-[rgba(65,66,71,.08)]">{category.total}</div>
                      </div>
                    </div>
                    {(activeItem === category.name  || category.subcategories?.find((item) => item.name === activeItem)) && category.subcategories && (
                      <ul className="ml-6 mt-2">
                        {category.subcategories.map((child, childIndex) => (
                          <li key={childIndex} className="mb-3" onClick={() => toggleCategory(child.name)}>
                            <div className={`flex items-center gap-2 cursor-pointer ${activeItem === child.name && 'font-semibold'} `}>
                              {
                                activeItem === child.name ? (
                                <CaretDownOutlined style={{ color: "grey", fontSize: "8px" }} />
                                ) : (
                                  <CaretUpOutlined style={{ color: "grey", fontSize: "8px" }} />
                                )
                              }
                              <div className="flex items-center gap-2">
                                <span>{child.name}</span>
                                <div className="text-xs font-semibold p-0.5 rounded bg-[rgba(65,66,71,.08)]">{child.total}</div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))
              }
            </ul>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Brands</h2>
            <Input
              placeholder="Search for brands..."
              prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.8)', fontSize: '12px', padding: '0 8px' }} />}
              size="large"
              style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', border: 'none' }}
            />
            <div className="mt-4">
              <Checkbox.Group options={brandOptions} value={queryFilter.brand} onChange={(value) => onFilterChange('brand', value)} className="flex flex-col gap-2"/>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Price</h2>
            <Slider
              range
              min={priceRange[0]}
              max={priceRange[1]}
              styles={
                {
                  track: {
                    backgroundColor: '#e2a400'
                  }
                }
              }
              step={1}
              defaultValue={priceRange}
              onChangeComplete={(value) => onFilterChange('priceRange', value)}
            />
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Free shipping</h2>
            <div className="flex gap-1">
              <span className="text-[.9rem] ">Display only items with free shipping</span>
              <div className="flex items-center gap-1">
                <span className={`${true && 'text-[#e2a400]'} text-[.8rem]`}>{true? 'Yes' : 'No'}</span>
                <Switch
                  value={queryFilter.freeShipping}
                  onChange={(value) => onFilterChange('freeShipping', value)}
                  defaultChecked size={'small'}
                  className="text-[#e2a400]"
                />
              </div>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Ratings</h2>
            <div>
              {Object.entries(ratings).reverse().map(([key, value]) => (
                <div className="flex items-center gap-2 cursor-pointer" key={key} onClick={() => onFilterChange('rating', key)}>
                  <Rate disabled defaultValue={Number(key)} />
                  <span className="ratings-count">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </nav>
        <div className="w-[946px]">
          <div className="mt-8 mb-1.5 text-end">
            <Select
              defaultValue="featured"
              // style={{ width: 150 }}
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
              total={products.length}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
